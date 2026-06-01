import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const analyzeResume = async (resumeText) => {
  const prompt = `
You are an expert ATS (Applicant Tracking System) analyzer and career coach. 
Analyze the following resume text and provide a detailed JSON response.

Resume Text:
"""
${resumeText}
"""

Provide a JSON response with this exact structure:
{
  "atsScore": number (0-100),
  "skills": [string array of technical and soft skills found],
  "education": [
    {
      "institution": string,
      "degree": string,
      "year": string
    }
  ],
  "experience": [
    {
      "company": string,
      "role": string,
      "duration": string,
      "description": string
    }
  ],
  "projects": [
    {
      "name": string,
      "description": string,
      "techStack": [string array]
    }
  ],
  "missingKeywords": [string array of important missing keywords for tech roles],
  "suggestions": [string array of specific improvement suggestions],
  "strengths": [string array],
  "weaknesses": [string array]
}

Be thorough and specific. Consider modern tech industry standards.
`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 4000,
      response_format: { type: 'json_object' }
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error('Groq API Error:', error);
    throw new Error('Failed to analyze resume');
  }
};

export const matchJobDescription = async (resumeSkills, jdText) => {
  const prompt = `
You are a job matching expert. Compare the candidate's skills with the job description.

Candidate Skills: ${JSON.stringify(resumeSkills)}

Job Description:
"""
${jdText}
"""

Provide a JSON response:
{
  "matchScore": number (0-100),
  "matchedSkills": [string array],
  "missingSkills": [string array],
  "criticalMissing": [string array of must-have skills],
  "readinessScore": number (0-100),
  "recommendations": [string array]
}

Be strict and realistic about matching.
`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.2,
      max_tokens: 2000,
      response_format: { type: 'json_object' }
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error('Groq JD Match Error:', error);
    throw new Error('Failed to match job description');
  }
};

export const generateRoadmap = async (currentSkills, targetRole) => {
  const prompt = `
You are a senior tech career mentor. Create a learning roadmap.

Current Skills: ${JSON.stringify(currentSkills)}
Target Role: ${targetRole}

Provide a JSON response:
{
  "targetSkills": [string array of required skills for the role],
  "missingSkills": [string array],
  "timeline": [
    {
      "week": string (e.g., "Week 1-2"),
      "title": string,
      "topics": [string array],
      "resources": [
        {
          "title": string,
          "url": string (use placeholder like "https://example.com/resource"),
          "type": "video" | "article" | "practice" | "project"
        }
      ]
    }
  ],
  "estimatedWeeks": number,
  "priority": "high" | "medium" | "low"
}

Create a practical, week-by-week roadmap. Include 8-12 weeks typically.
`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.4,
      max_tokens: 4000,
      response_format: { type: 'json_object' }
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error('Groq Roadmap Error:', error);
    throw new Error('Failed to generate roadmap');
  }
};

export const generateInterviewQuestions = async (type, role, experience, techStack) => {
  const prompt = `
You are an experienced technical interviewer at a top tech company.
Generate interview questions for a candidate.

Type: ${type} (HR/Technical/Project/System Design/Mixed)
Role: ${role}
Experience: ${experience}
Tech Stack: ${JSON.stringify(techStack)}

Provide a JSON response:
{
  "questions": [
    {
      "question": string,
      "category": string (e.g., "DSA", "System Design", "Behavioral", "JavaScript", etc.),
      "difficulty": "easy" | "medium" | "hard",
      "expectedAnswerPoints": [string array of key points expected in answer]
    }
  ],
  "estimatedDuration": number (minutes),
  "focusAreas": [string array]
}

Generate 8-12 relevant questions. Make them realistic and challenging.
`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.5,
      max_tokens: 4000,
      response_format: { type: 'json_object' }
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error('Groq Interview Error:', error);
    throw new Error('Failed to generate interview questions');
  }
};

export const evaluateInterviewAnswer = async (question, userAnswer, expectedPoints) => {
  const prompt = `
You are evaluating a candidate's interview response.

Question: ${question}
Expected Key Points: ${JSON.stringify(expectedPoints)}
Candidate's Answer: ${userAnswer}

Provide a JSON response:
{
  "score": number (0-10),
  "feedback": string (detailed constructive feedback),
  "missingPoints": [string array of points missed],
  "strengths": [string array],
  "communicationRating": number (1-10),
  "technicalDepthRating": number (1-10),
  "confidenceRating": number (1-10)
}

Be fair but thorough. Consider communication clarity, technical accuracy, and depth.
`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 2000,
      response_format: { type: 'json_object' }
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error('Groq Evaluation Error:', error);
    throw new Error('Failed to evaluate answer');
  }
};

export const calculateReadiness = async (userData) => {
  const prompt = `
You are a placement readiness assessor. Evaluate this candidate's profile.

Profile Data:
${JSON.stringify(userData, null, 2)}

Provide a JSON response:
{
  "overallScore": number (0-100),
  "breakdown": {
    "resume": number (0-100),
    "skills": number (0-100),
    "dsa": number (0-100),
    "projects": number (0-100),
    "communication": number (0-100)
  },
  "verdict": string (e.g., "Ready for placements", "Needs improvement", "Not ready"),
  "strengths": [string array],
  "gaps": [string array],
  "actionItems": [string array of specific next steps],
  "timelineToReady": string
}

Be realistic. A good CS student with solid DSA and projects should score 70-85.
`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 2000,
      response_format: { type: 'json_object' }
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error('Groq Readiness Error:', error);
    throw new Error('Failed to calculate readiness');
  }
};