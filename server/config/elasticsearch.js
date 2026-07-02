const { Client } = require('@elastic/elasticsearch');

let esClient = null;
let isElasticsearchEnabled = false;

const initElasticsearch = async () => {
  const node = process.env.ELASTICSEARCH_NODE;
  if (!node) {
    console.log('Elasticsearch node not configured. Falling back to MongoDB search.');
    return null;
  }

  try {
    const config = { node };
    if (process.env.ELASTICSEARCH_USERNAME && process.env.ELASTICSEARCH_PASSWORD) {
      config.auth = {
        username: process.env.ELASTICSEARCH_USERNAME,
        password: process.env.ELASTICSEARCH_PASSWORD
      };
    }

    esClient = new Client(config);
    // Ping to check connection
    await esClient.ping();
    isElasticsearchEnabled = true;
    console.log('Elasticsearch Connected Successfully.');
    
    // Check/create index 'jobs'
    const indexExists = await esClient.indices.exists({ index: 'jobs' });
    if (!indexExists) {
      await esClient.indices.create({
        index: 'jobs',
        body: {
          mappings: {
            properties: {
              title: { type: 'text' },
              description: { type: 'text' },
              requirements: { type: 'text' },
              location: { type: 'keyword' },
              salaryRangeMin: { type: 'integer' },
              salaryRangeMax: { type: 'integer' },
              jobType: { type: 'keyword' },
              category: { type: 'keyword' },
              companyName: { type: 'text' },
              status: { type: 'keyword' }
            }
          }
        }
      });
      console.log("Elasticsearch 'jobs' index created.");
    }
  } catch (error) {
    console.error('Elasticsearch connection failed. Falling back to MongoDB text search.', error.message);
    esClient = null;
    isElasticsearchEnabled = false;
  }
};

const indexJob = async (job, companyName) => {
  if (!isElasticsearchEnabled || !esClient) return;
  try {
    await esClient.index({
      index: 'jobs',
      id: job._id.toString(),
      body: {
        title: job.title,
        description: job.description,
        requirements: job.requirements.join(' '),
        location: job.location,
        salaryRangeMin: job.salaryRange?.min || 0,
        salaryRangeMax: job.salaryRange?.max || 0,
        jobType: job.jobType,
        category: job.category,
        companyName: companyName || '',
        status: job.status
      }
    });
  } catch (error) {
    console.error('Error indexing job in Elasticsearch:', error.message);
  }
};

const deleteJobFromIndex = async (jobId) => {
  if (!isElasticsearchEnabled || !esClient) return;
  try {
    await esClient.delete({
      index: 'jobs',
      id: jobId.toString()
    });
  } catch (error) {
    console.error('Error deleting job from Elasticsearch:', error.message);
  }
};

const searchJobs = async (queryParams) => {
  if (!isElasticsearchEnabled || !esClient) {
    return null; // Signals controller to fallback to MongoDB search
  }

  const { query, location, category, jobType, salaryMin, salaryMax } = queryParams;
  
  const must = [];
  const filter = [];

  // Match approved jobs only
  must.push({ term: { status: 'approved' } });

  if (query) {
    must.push({
      multi_match: {
        query,
        fields: ['title^3', 'description', 'requirements', 'companyName^2'],
        fuzziness: 'AUTO'
      }
    });
  }

  if (location) {
    filter.push({ term: { location } });
  }

  if (category) {
    filter.push({ term: { category } });
  }

  if (jobType) {
    filter.push({ term: { jobType } });
  }

  if (salaryMin !== undefined || salaryMax !== undefined) {
    const range = {};
    if (salaryMin !== undefined) range.gte = parseInt(salaryMin, 10);
    if (salaryMax !== undefined) range.lte = parseInt(salaryMax, 10);
    filter.push({
      range: {
        salaryRangeMax: range
      }
    });
  }

  try {
    const result = await esClient.search({
      index: 'jobs',
      body: {
        query: {
          bool: {
            must,
            filter
          }
        }
      }
    });

    return result.hits.hits.map(hit => ({
      _id: hit._id,
      ...hit._source
    }));
  } catch (error) {
    console.error('Elasticsearch search error:', error.message);
    return null; // Fallback
  }
};

module.exports = {
  initElasticsearch,
  indexJob,
  deleteJobFromIndex,
  searchJobs,
  getEsEnabled: () => isElasticsearchEnabled
};
