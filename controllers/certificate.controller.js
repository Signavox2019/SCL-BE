const generateCertificate = require('../utils/certificateGenerator');
const sendCertificateMail = require('../utils/mailer');
const Progress = require('../models/Progress');
const User = require('../models/User');
const Course = require('../models/Course');
const path = require('path');

const Certificate = require('../models/Certificate');
const generateCertificateId = require('../utils/generateCertificateId');

// Generate Certificate (auto trigger)
exports.generateCertificate = async (req, res) => {
    try {
        const { userId, courseId, score } = req.body;

        const user = await User.findById(userId);
        const course = await Course.findById(courseId);
        if (!user || !course) return res.status(404).json({ message: 'Invalid user or course' });

        const certificate = await Certificate.create({
            certificateId: generateCertificateId(),
            user: userId,
            course: courseId,
            score,
            passed: true,
            downloadLink: `/certificates/${userId}_${courseId}.pdf`
        });

        res.status(201).json({ message: 'Certificate issued', certificate });
    } catch (err) {
        res.status(500).json({ message: 'Failed to issue certificate', error: err });
    }
};

// Get certificate by user & course
exports.getUserCertificate = async (req, res) => {
    try {
        const cert = await Certificate.findOne({
            user: req.params.userId,
            course: req.params.courseId
        }).populate('user course');

        if (!cert) return res.status(404).json({ message: 'Certificate not found' });

        res.status(200).json(cert);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching certificate', error: err });
    }
};

// Validate certificate by certificateId
exports.validateCertificate = async (req, res) => {
    try {
        const cert = await Certificate.findOne({ certificateId: req.params.id }).populate('user course');
        if (!cert) return res.status(404).json({ message: 'Invalid Certificate ID' });

        res.status(200).json({
            valid: true,
            issuedTo: cert.user.fullName || cert.user.name,
            courseTitle: cert.course.title,
            issuedAt: cert.issuedAt,
            score: cert.score
        });
    } catch (err) {
        res.status(500).json({ message: 'Validation failed', error: err });
    }
};

// Download certificate (mock - in production use PDFKit or Puppeteer)
exports.downloadCertificate = async (req, res) => {
    try {
        const cert = await Certificate.findOne({ certificateId: req.params.id }).populate('user course');
        if (!cert) return res.status(404).json({ message: 'Certificate not found' });

        const fakePDFPath = `certificates/${cert.user._id}_${cert.course._id}.pdf`;
        res.download(fakePDFPath, `${cert.user.name}_${cert.course.title}_certificate.pdf`);
    } catch (err) {
        res.status(500).json({ message: 'Download failed', error: err });
    }
};

// Get all certificates
exports.getAllCertificates = async (req, res) => {
    try {
        const certs = await Certificate.find().populate('user course');
        res.status(200).json(certs);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch certificates', error: err });
    }
};

// Certificate stats
exports.certificateStats = async (req, res) => {
    try {
        const total = await Certificate.countDocuments();
        const validated = await Certificate.countDocuments({ validated: true });
        const uniqueUsers = await Certificate.distinct('user');

        res.status(200).json({ total, validated, uniqueUsers: uniqueUsers.length });
    } catch (err) {
        res.status(500).json({ message: 'Stats fetch error', error: err });
    }
};


exports.issueCertificate = async (req, res) => {
    try {
        const { userId, courseId } = req.body;

        const user = await User.findById(userId);
        const course = await Course.findById(courseId);
        const progress = await Progress.findOne({ user: userId, course: courseId });

        if (!progress || !progress.isCompleted) {
            return res.status(400).json({ message: 'User has not completed the course' });
        }

        const certificateId = `CERT-${userId.slice(-4)}-${Date.now()}`;
        const certPath = await generateCertificate({
            userName: user.name,
            courseTitle: course.title,
            completionDate: new Date().toDateString(),
            certificateId,
        });

        // Save cert path
        progress.certificateUrl = `/certificates/${certificateId}.pdf`;
        await progress.save();

        // Email to user
        await sendCertificateMail(user.email, user.name, certPath);

        res.status(200).json({
            message: 'Certificate generated and emailed successfully',
            certificateUrl: progress.certificateUrl
        });

    } catch (error) {
        res.status(500).json({ message: 'Certificate generation failed', error });
    }
};
