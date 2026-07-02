require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const CandidateProfile = require('../models/CandidateProfile');
const RecruiterProfile = require('../models/RecruiterProfile');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Interview = require('../models/Interview');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');

const seedData = async () => {
  try {
    console.log('Connecting to database for seeding...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jobportal');
    console.log('Connected.');

    // Clear existing collections
    console.log('Clearing old collections...');
    await User.deleteMany({});
    await CandidateProfile.deleteMany({});
    await RecruiterProfile.deleteMany({});
    await Job.deleteMany({});
    await Application.deleteMany({});
    await Interview.deleteMany({});
    await Notification.deleteMany({});
    await AuditLog.deleteMany({});
    console.log('Collections cleared.');

    // Create Admin
    console.log('Creating Admin user...');
    const admin = await User.create({
      email: 'admin@portal.com',
      password: 'password123',
      name: 'System Admin',
      role: 'admin'
    });

    // Create Recruiters
    console.log('Creating Recruiter users...');
    const rec1User = await User.create({
      email: 'recruiter1@techcorp.com',
      password: 'password123',
      name: 'TechCorp Recruiter',
      role: 'recruiter'
    });
    const rec1Profile = await RecruiterProfile.create({
      userId: rec1User._id,
      companyName: 'TechCorp Solutions',
      industry: 'IT & Software',
      website: 'https://techcorp.example.com',
      location: 'San Francisco, CA',
      description: 'A leading provider of enterprise cloud products and developer tools.'
    });

    const rec2User = await User.create({
      email: 'recruiter2@creativeagency.com',
      password: 'password123',
      name: 'Apex Recruiter',
      role: 'recruiter'
    });
    const rec2Profile = await RecruiterProfile.create({
      userId: rec2User._id,
      companyName: 'Apex Creative Agency',
      industry: 'Design & Marketing',
      website: 'https://apexcreative.example.com',
      location: 'New York, NY',
      description: 'Creating award-winning digital campaigns and design experiences.'
    });

    // Create Candidates
    console.log('Creating Candidate users...');
    const cand1User = await User.create({
      email: 'john.doe@email.com',
      password: 'password123',
      name: 'John Doe',
      role: 'candidate'
    });
    const cand1Profile = await CandidateProfile.create({
      userId: cand1User._id,
      name: 'John Doe',
      phone: '123-456-7890',
      skills: ['JavaScript', 'React', 'Node', 'Express', 'MongoDB', 'CSS'],
      education: [{
        school: 'State University',
        degree: 'Bachelor of Science',
        fieldOfStudy: 'Computer Science',
        from: new Date('2018-09-01'),
        to: new Date('2022-06-01'),
        current: false
      }],
      experience: [{
        company: 'WebDev Labs',
        position: 'Junior Full Stack Developer',
        location: 'Remote',
        from: new Date('2022-07-01'),
        to: new Date('2024-03-01'),
        current: false,
        description: 'Developed frontend interfaces using React.js and backend API routes using Express.'
      }]
    });

    const cand2User = await User.create({
      email: 'jane.smith@email.com',
      password: 'password123',
      name: 'Jane Smith',
      role: 'candidate'
    });
    const cand2Profile = await CandidateProfile.create({
      userId: cand2User._id,
      name: 'Jane Smith',
      phone: '987-654-3210',
      skills: ['UI/UX', 'Figma', 'Photoshop', 'Marketing', 'SEO'],
      education: [{
        school: 'Art Institute of Design',
        degree: 'Bachelor of Fine Arts',
        fieldOfStudy: 'Graphic Design',
        from: new Date('2019-09-01'),
        to: new Date('2023-05-01'),
        current: false
      }],
      experience: [{
        company: 'DesignWorks Co',
        position: 'Graphic Designer',
        location: 'New York, NY',
        from: new Date('2023-06-01'),
        current: true,
        description: 'Designed social media campaigns, mockups, and client websites.'
      }]
    });

    // Create Jobs
    console.log('Creating Jobs...');
    const job1 = await Job.create({
      title: 'Senior React Developer',
      description: 'Looking for a highly skilled React developer with 5+ years of experience to lead our frontend application development. You will build user-friendly dashboard interfaces, integrate real-time widgets, and optimize site speeds.',
      requirements: ['5+ years React.js experience', 'Redux Toolkit / State Management proficiency', 'Excellent communication skills', 'TypeScript knowledge is a plus'],
      salaryRange: { min: 90000, max: 130000, currency: 'USD' },
      jobType: 'Full-time',
      location: 'San Francisco, CA',
      category: 'IT & Software',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      status: 'approved',
      postedBy: rec1User._id,
      recruiterProfileId: rec1Profile._id
    });

    const job2 = await Job.create({
      title: 'Digital Marketing Strategist',
      description: 'Join our marketing agency to run campaigns, perform SEO optimization, and manage brand advertisements for high-profile clients.',
      requirements: ['3+ years digital marketing experience', 'SEO/SEM tools knowledge (Google Analytics, SEMrush)', 'Social media growth experience'],
      salaryRange: { min: 60000, max: 80000, currency: 'USD' },
      jobType: 'Full-time',
      location: 'New York, NY',
      category: 'Marketing',
      deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      status: 'approved',
      postedBy: rec2User._id,
      recruiterProfileId: rec2Profile._id
    });

    const job3 = await Job.create({
      title: 'UI/UX Design Intern',
      description: 'Exciting learning opportunity for a passionate designer. Help create Figma mockups, interactive prototypes, and participate in user research sessions.',
      requirements: ['Basic Figma knowledge', 'Strong portfolio showing typography & layout skills', 'Willingness to learn'],
      salaryRange: { min: 20, max: 30, currency: 'USD' }, // Hourly equivalent or low range
      jobType: 'Internship',
      location: 'Remote',
      category: 'Design & Art',
      deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      status: 'pending', // Pending Admin Moderation
      postedBy: rec2User._id,
      recruiterProfileId: rec2Profile._id
    });

    // Create Applications
    console.log('Creating Applications...');
    const app1 = await Application.create({
      jobId: job1._id,
      candidateId: cand1User._id,
      candidateProfileId: cand1Profile._id,
      resumeUrl: '/uploads/resumes/resume-mockup-pdf.pdf',
      status: 'Under Review',
      statusHistory: [
        { status: 'Applied', note: 'Applied via portal', updatedBy: cand1User._id },
        { status: 'Under Review', note: 'Moving along recruitment pipeline', updatedBy: rec1User._id }
      ]
    });

    const app2 = await Application.create({
      jobId: job2._id,
      candidateId: cand2User._id,
      candidateProfileId: cand2Profile._id,
      resumeUrl: '/uploads/resumes/resume-jane-smith.pdf',
      status: 'Shortlisted',
      statusHistory: [
        { status: 'Applied', note: 'Applied via portal', updatedBy: cand2User._id },
        { status: 'Shortlisted', note: 'Resume fits requirements', updatedBy: rec2User._id }
      ]
    });

    // Create Scheduled Interview
    console.log('Creating Scheduled Interview...');
    await Interview.create({
      jobId: job2._id,
      recruiterId: rec2User._id,
      candidateId: cand2User._id,
      applicationId: app2._id,
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      time: '14:00',
      mode: 'online',
      meetingLink: 'https://zoom.us/j/1234567890',
      status: 'Scheduled'
    });

    // Create Audit Logs
    console.log('Creating Audit Logs...');
    await AuditLog.create({
      actorId: admin._id,
      action: 'system_initialized',
      details: 'System db seeded successfully with demo data.'
    });

    console.log('Database successfully seeded!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
