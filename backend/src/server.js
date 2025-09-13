import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { prisma } from './db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Parser } from 'json2csv';
import { protect } from './middleware/auth.js';
import path from 'path';
import serverless from 'serverless-http';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use('/images', express.static('public/images'));


// --- MULTER CONFIGURATION ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });
// Add this new route in server.js
app.put('/api/admin/change-password', protect, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    
    // The 'protect' middleware gives us the logged-in admin's info
    const adminId = req.admin.id;

    // 1. Find the current admin in the database
    const admin = await prisma.admin.findUnique({ where: { id: adminId } });
    if (!admin) {
      return res.status(404).json({ error: "Admin user not found." });
    }

    // 2. Verify their old password is correct
    const isMatch = await bcrypt.compare(oldPassword, admin.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Incorrect old password." });
    }

    // 3. Hash the new password and update the database
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await prisma.admin.update({
      where: { id: adminId },
      data: { password: hashedNewPassword },
    });

    res.json({ message: "Password updated successfully." });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ error: "Failed to change password." });
  }
});

// --- PARTNER ROUTES ---
app.get('/api/partners', async (req, res) => {
  try {
    const { search } = req.query;
    const whereClause = search ? { bankName: { contains: search, mode: 'insensitive' } } : {};
    const partners = await prisma.partner.findMany({ where: whereClause, orderBy: { bankName: 'asc' } });
    res.json(partners);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch partners." });
  }
});
app.post('/api/partners', protect, async (req, res) => {
  try {
    const { bankName, logoUrl } = req.body;
    const newPartner = await prisma.partner.create({ data: { bankName, logoUrl } });
    res.status(201).json(newPartner);
  } catch (error) {
    res.status(500).json({ error: "Failed to create partner." });
  }
});
app.delete('/api/partners/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.partner.delete({ where: { id: parseInt(id) } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete partner." });
  }
});


// --- JOB OPENING ROUTES ---
app.get('/api/jobs', async (req, res) => {
  try {
    const { search } = req.query;
    const whereClause = { isActive: true };
    if (search) {
      whereClause.roleTitle = { contains: search, mode: 'insensitive' };
    }
    const jobs = await prisma.jobOpening.findMany({ where: whereClause, orderBy: { roleTitle: 'asc' } });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch jobs." });
  }
});
app.get('/api/job-titles', protect, async (req, res) => {
  try {
    const jobs = await prisma.jobOpening.findMany({
      select: { id: true, roleTitle: true },
      where: { isActive: true }
    });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch job titles." });
  }
});
app.post('/api/jobs', protect, async (req, res) => {
  try {
    const { roleTitle, openingsCount, jobDescription } = req.body;
    const newJob = await prisma.jobOpening.create({
      data: { roleTitle, openingsCount: parseInt(openingsCount), jobDescription },
    });
    res.status(201).json(newJob);
  } catch (error) {
    res.status(500).json({ error: "Failed to create job." });
  }
});
app.delete('/api/jobs/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.jobOpening.delete({ where: { id: parseInt(id) } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete job." });
  }
});


// --- JOB APPLICATION ROUTES ---
app.post('/api/applications', upload.single('resume'), async (req, res) => {
  try {
    const { applicantName, applicantEmail, applicantPhone, jobId } = req.body;
    const resumeUrl = req.file.path;
    await prisma.jobApplication.create({
      data: { applicantName, applicantEmail, applicantPhone, jobId: parseInt(jobId), resumeUrl },
    });
    res.status(201).json({ message: 'Application submitted successfully!' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit application.' });
  }
});
app.get('/api/applications', protect, async (req, res) => {
  try {
    const { search, jobId, startDate, endDate } = req.query; // Add date queries
    const whereClause = {};

    if (search) {
      whereClause.applicantName = { contains: search, mode: 'insensitive' };
    }
    if (jobId) {
      whereClause.jobId = parseInt(jobId);
    }
    // Add date filtering to the where clause
    if (startDate && endDate) {
      whereClause.appliedAt = {
        gte: new Date(startDate), // gte = Greater than or equal to
        lte: new Date(endDate),   // lte = Less than or equal to
      };
    }

    const applications = await prisma.jobApplication.findMany({
      where: whereClause,
      orderBy: { appliedAt: 'desc' },
      include: {
        job: { select: { roleTitle: true } },
      },
    });
    res.json(applications);
  } catch (error) {
    console.error('Failed to fetch applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications.' });
  }
});
app.delete('/api/applications/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.jobApplication.delete({ where: { id: parseInt(id) } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete application.' });
  }
});
app.delete('/api/applications', protect, async (req, res) => {
  try {
    await prisma.jobApplication.deleteMany();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete all applications.' });
  }
});
app.get('/api/applications/export', protect, async (req, res) => {
    try {
        const applications = await prisma.jobApplication.findMany({
            orderBy: { appliedAt: 'desc' },
            include: { job: { select: { roleTitle: true } } },
        });
        const flatApplications = applications.map(app => ({
            id: app.id, applicantName: app.applicantName, applicantEmail: app.applicantEmail,
            applicantPhone: app.applicantPhone, appliedFor: app.job.roleTitle, resumeUrl: app.resumeUrl, appliedAt: app.appliedAt,
        }));
        const fields = ['id', 'applicantName', 'applicantEmail', 'applicantPhone', 'appliedFor', 'resumeUrl', 'appliedAt'];
        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(flatApplications);
        res.header('Content-Type', 'text/csv');
        res.attachment('applications.csv');
        res.send(csv);
    } catch (error) {
        res.status(500).json({ error: 'Failed to export applications.' });
    }
});


// --- SERVICE LEAD ROUTES ---
app.post('/api/leads', async (req, res) => {
  try {
    const { name, phone, email, serviceRequested } = req.body;
    if (!name || !phone || !email || !serviceRequested) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    await prisma.serviceLead.create({
      data: { name, phone, email, serviceRequested },
    });
    res.status(201).json({ message: 'Inquiry submitted successfully!' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit inquiry.' });
  }
});
app.get('/api/leads', protect, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let whereClause = {};
    if (startDate && endDate) {
      whereClause.submittedAt = { gte: new Date(startDate), lte: new Date(endDate) };
    }
    const leads = await prisma.serviceLead.findMany({ where: whereClause, orderBy: { submittedAt: 'desc' } });
    res.json(leads);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leads.' });
  }
});
app.delete('/api/leads/:id', protect, async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.serviceLead.delete({ where: { id: parseInt(id) } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete lead.' });
    }
});
app.delete('/api/leads', protect, async (req, res) => {
    try {
        await prisma.serviceLead.deleteMany();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete all leads.' });
    }
});
app.get('/api/leads/export', protect, async (req, res) => {
    try {
        const leads = await prisma.serviceLead.findMany({ orderBy: { submittedAt: 'desc' } });
        const fields = ['id', 'name', 'phone', 'email', 'serviceRequested', 'submittedAt'];
        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(leads);
        res.header('Content-Type', 'text/csv');
        res.attachment('leads.csv');
        res.send(csv);
    } catch (error) {
        res.status(500).json({ error: 'Failed to export leads.' });
    }
});


// --- ADMIN AUTHENTICATION ROUTES ---
app.post('/api/admin/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = await prisma.admin.create({ data: { username, password: hashedPassword } });
    res.status(201).json({ id: newAdmin.id, username: newAdmin.username });
  } catch (error) {
    if (error.code === 'P2002') return res.status(409).json({ error: "Username already exists." });
    res.status(500).json({ error: "Failed to register admin." });
  }
});
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await prisma.admin.findUnique({ where: { username } });
    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      return res.status(401).json({ error: "Invalid credentials." });
    }
    const token = jwt.sign({ id: admin.id }, process.env.JWT_SECRET, { expiresIn: '8h' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: "Login failed." });
  }
});


// --- HOME PAGE STATS ROUTES ---
app.get('/api/homepage-stats', async (req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-store');
    const stats = await prisma.homePageStat.findFirst();
    res.json(stats || { loanDisbursed: '0 CR' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats.' });
  }
});
app.put('/api/homepage-stats', protect, async (req, res) => {
  try {
    const { loanDisbursed } = req.body;
    const updatedStats = await prisma.homePageStat.upsert({
      where: { id: 1 },
      update: { loanDisbursed },
      create: { id: 1, loanDisbursed },
    });
    res.json(updatedStats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update stats.' });
  }
});


// --- START THE SERVER ---
// app.listen(PORT, () => {
//   console.log(`✅ Server is running on port ${PORT}`);
// });
// This exports the app as a serverless function
export const handler = serverless(app);