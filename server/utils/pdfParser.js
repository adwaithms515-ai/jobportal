const pdf = require('pdf-parse');

const COMMON_SKILLS = [
  'javascript', 'typescript', 'react', 'vue', 'angular', 'node', 'express',
  'mongodb', 'sql', 'postgresql', 'mysql', 'python', 'java', 'c++', 'c#',
  'ruby', 'rails', 'php', 'laravel', 'html', 'css', 'tailwind', 'bootstrap',
  'aws', 'docker', 'kubernetes', 'git', 'github', 'jira', 'agile', 'scrum',
  'excel', 'word', 'powerpoint', 'photoshop', 'figma', 'ui/ux', 'seo',
  'marketing', 'sales', 'finance', 'accounting', 'project management',
  'product management', 'data analysis', 'machine learning', 'deep learning'
];

const parseResumePDF = async (fileBuffer) => {
  try {
    const data = await pdf(fileBuffer);
    const text = data.text;
    
    // Lowcase text for matching
    const lowerText = text.toLowerCase();
    
    // Extract Email
    const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
    const email = emailMatch ? emailMatch[0] : '';
    
    // Extract Phone
    const phoneMatch = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    const phone = phoneMatch ? phoneMatch[0] : '';
    
    // Extract Skills
    const skills = [];
    COMMON_SKILLS.forEach(skill => {
      const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (regex.test(text)) {
        // Format nicely
        const formattedSkill = skill.charAt(0).toUpperCase() + skill.slice(1);
        skills.push(formattedSkill);
      }
    });

    // Auto-generate profile fields based on simple text heuristics
    // Try to find Name (normally first line of resume)
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    let name = '';
    if (lines.length > 0) {
      // First line might be name, check if it doesn't contain email or website
      const firstLine = lines[0];
      if (!firstLine.includes('@') && !firstLine.includes('/') && firstLine.length < 50) {
        name = firstLine;
      }
    }

    // Try to parse out structure: Education and Experience
    const education = [];
    const experience = [];
    
    // Simple heuristic parser
    // Look for lines containing "Education" and sections
    let currentSection = ''; // 'education', 'experience', or ''
    
    lines.forEach((line, index) => {
      const lowerLine = line.toLowerCase();
      
      if (lowerLine.includes('education') || lowerLine.includes('academic') || lowerLine.includes('studies')) {
        currentSection = 'education';
        return;
      }
      if (lowerLine.includes('experience') || lowerLine.includes('work history') || lowerLine.includes('employment') || lowerLine.includes('professional background')) {
        currentSection = 'experience';
        return;
      }
      if (lowerLine.includes('skills') || lowerLine.includes('certifications') || lowerLine.includes('projects')) {
        currentSection = '';
        return;
      }

      if (currentSection === 'education' && line.length > 10) {
        // Try to build a structured education block
        const parts = line.split(/,|\bat\b/i).map(p => p.trim());
        if (parts.length >= 2) {
          education.push({
            school: parts[1] || 'University/School',
            degree: parts[0] || 'Degree',
            fieldOfStudy: parts[2] || '',
            current: lowerLine.includes('present') || lowerLine.includes('current')
          });
        }
      }

      if (currentSection === 'experience' && line.length > 10) {
        const parts = line.split(/,|\bat\b/i).map(p => p.trim());
        if (parts.length >= 2) {
          experience.push({
            company: parts[1] || 'Company',
            position: parts[0] || 'Job Position',
            description: line,
            current: lowerLine.includes('present') || lowerLine.includes('current')
          });
        }
      }
    });

    // Check if Gemini API key is configured
    if (process.env.GEMINI_API_KEY) {
      console.log('Gemini API Key detected. Performing high-accuracy AI resume parsing...');
      try {
        const prompt = `
          Analyze the following raw text extracted from a resume. Extract the candidate's name, phone number, list of professional skills, education history, and work experience history. 

          Return ONLY a valid JSON object matching the following structure. Do not wrap it in markdown block quotes (do NOT include \`\`\`json or similar). Do not add explanations. Just return the JSON object:
          {
            "name": "Candidate's Full Name (or empty string if not found)",
            "phone": "Candidate's Phone Number (or empty string if not found)",
            "skills": ["Skill1", "Skill2", ...],
            "education": [
              {
                "school": "Name of university/school",
                "degree": "Name of degree (e.g. BS, MS)",
                "fieldOfStudy": "Field of study (e.g. Computer Science)",
                "current": false
              }
            ],
            "experience": [
              {
                "company": "Company Name",
                "position": "Job Title",
                "description": "Brief summary of responsibilities",
                "current": false
              }
            ]
          }

          Resume Text:
          ${text}
        `;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }]
          })
        });

        if (response.ok) {
          const resData = await response.json();
          let jsonText = resData.candidates?.[0]?.content?.parts?.[0]?.text || '';
          
          // Clean any stray markdown formatting if Gemini included it
          jsonText = jsonText.trim();
          if (jsonText.startsWith('```json')) {
            jsonText = jsonText.substring(7);
          }
          if (jsonText.endsWith('```')) {
            jsonText = jsonText.substring(0, jsonText.length - 3);
          }
          jsonText = jsonText.trim();

          const parsedObj = JSON.parse(jsonText);
          
          return {
            name: parsedObj.name || name,
            email: email, // Keep email matched via regex since it's highly accurate
            phone: parsedObj.phone || phone,
            skills: parsedObj.skills || skills,
            education: parsedObj.education || education,
            experience: parsedObj.experience || experience,
            rawText: text
          };
        } else {
          console.warn('Gemini API call failed. Falling back to heuristic parsing.');
        }
      } catch (geminiError) {
        console.error('Error during Gemini AI parsing, falling back to heuristic parsing:', geminiError.message);
      }
    }

    // In case no structured data could be matched or Gemini was not enabled, provide fallbacks
    return {
      name,
      email,
      phone,
      skills,
      education: education.slice(0, 3), // Max 3 items
      experience: experience.slice(0, 3), // Max 3 items
      rawText: text
    };
  } catch (error) {
    console.error('Error parsing resume PDF:', error.message);
    throw new Error('Could not parse resume PDF');
  }
};

module.exports = { parseResumePDF };
