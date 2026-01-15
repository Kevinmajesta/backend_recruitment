const prisma = require("../prisma/client/index");
const { validationResult } = require("express-validator");

const apply = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ success: false, errors: errors.array() });

  try {
    const applicant = await prisma.applicant.create({ data: req.body }); // Public apply
    res.status(201).json({ success: true, data: applicant });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getApplicants = async (req, res) => {
  try {
    const { positionId } = req.query;
    const applicants = await prisma.applicant.findMany({
      where: {
        positionId: positionId,
        position: { companyId: req.user.companyId } // Multi-tenancy check
      },
      include: { position: { select: { title: true } } }
    });
    res.json({ success: true, data: applicants });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getApplicantById = async (req, res) => {
  try {
    const applicant = await prisma.applicant.findFirst({
      where: { id: req.params.id, position: { companyId: req.user.companyId } },
      include: { position: true }
    });
    if (!applicant) return res.status(404).json({ success: false, message: "Applicant not found" });
    res.json({ success: true, data: applicant });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const updateStatus = async (req, res) => {
  try {
    const applicant = await prisma.applicant.updateMany({
      where: { id: req.params.id, position: { companyId: req.user.companyId } },
      data: { status: req.body.status } // Update status
    });
    if (applicant.count === 0) return res.status(404).json({ success: false, message: "Applicant not found" });
    res.json({ success: true, message: "Status updated" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const updateNotes = async (req, res) => {
  try {
    const applicant = await prisma.applicant.updateMany({
      where: { id: req.params.id, position: { companyId: req.user.companyId } },
      data: { notes: req.body.notes } // Update notes
    });
    if (applicant.count === 0) return res.status(404).json({ success: false, message: "Applicant not found" });
    res.json({ success: true, message: "Notes updated" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const deleteApplicant = async (req, res) => {
  try {
    const check = await prisma.applicant.findFirst({
      where: { id: req.params.id, position: { companyId: req.user.companyId } }
    });
    if (!check) return res.status(404).json({ success: false, message: "Applicant not found" });
    await prisma.applicant.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: "Applicant deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = { apply, getApplicants, getApplicantById, updateStatus, updateNotes, deleteApplicant };