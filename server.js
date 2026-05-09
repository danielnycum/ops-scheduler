import 'dotenv/config';
import express from 'express';
import Anthropic from '@anthropic-ai/sdk';

const PORT   = process.env.PORT || 3001;
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const app    = express();

// Force CORS headers on every response — local dev only
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin',  '*');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  next();
});

app.use(express.json({ limit: '4mb' }));

const SYSTEM_PROMPT =
  'You are a syllabus parser. Extract all assignments, exams, quizzes, and deadlines from the syllabus. ' +
  'Return ONLY a valid JSON array with no markdown, no code fences, no extra text. ' +
  'Each element must have exactly these fields: ' +
  'courseName (the course name or number, e.g. "ACG 3024"), ' +
  'taskTitle (the SPECIFIC name of the assignment exactly as written in the syllabus, e.g. "Chapter 5 Review Quiz", "Midterm Exam", "Case Study 2" — NOT generic labels like "homework" or "quiz"), ' +
  'dueDate (YYYY-MM-DD format, or null if not specified), ' +
  'gradeWeight (integer percentage weight toward final grade, 0 if unknown), ' +
  'estimatedHours (integer: use 8 for exams, 6 for papers/projects, 3 for quizzes, 2 for homework assignments, 1 for discussions). ' +
  'Example output: [{"courseName":"ACG 3024","taskTitle":"Chapter 3 Homework","dueDate":"2026-02-14","gradeWeight":5,"estimatedHours":2}]';

app.post('/api/parse-syllabus', async (req, res) => {
  const { text } = req.body;
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'text field required' });
  }

  try {
    const message = await client.messages.create({
      model:      'claude-sonnet-4-6',
      max_tokens: 4096,
      system:     SYSTEM_PROMPT,
      messages:   [{ role: 'user', content: `Parse this syllabus and return JSON:\n\n${text.slice(0, 120000)}` }],
    });

    const raw     = message.content.find(b => b.type === 'text')?.text?.trim() ?? '[]';
    const cleaned = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    const items   = JSON.parse(cleaned);

    if (!Array.isArray(items)) throw new Error('Model returned non-array response');
    res.json({ items });
  } catch (e) {
    console.error('Parse error:', e.message);
    res.status(500).json({ error: e.message || 'Failed to parse syllabus' });
  }
});

app.listen(PORT, () => console.log(`Clarus backend → http://localhost:${PORT}`));
