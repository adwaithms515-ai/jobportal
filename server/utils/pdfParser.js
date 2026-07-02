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

    // In case no structured data could be matched, provide fallbacks
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
