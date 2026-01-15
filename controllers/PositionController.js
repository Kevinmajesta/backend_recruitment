const prisma = require("../prisma/client/index");
const { validationResult } = require("express-validator");

const createPosition = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(422).json({ success: false, errors: errors.array() });

  try {
    const position = await prisma.position.create({
      data: {
        title: req.body.title,
        location: req.body.location,
        type: req.body.type,
        description: req.body.description,
        salary: req.body.salary,
        companyId: req.user.companyId, 
        createdBy: req.user.id, 
      },
    });

    res.status(201).json({ success: true, data: position });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getPositions = async (req, res) => {
  try {
    const positions = await prisma.position.findMany({
      where: { companyId: req.user.companyId }, 
    });
    res.json({ success: true, data: positions });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getPositionById = async (req, res) => {
  try {
    const position = await prisma.position.findFirst({
      where: { id: req.params.id, companyId: req.user.companyId },
    });
    if (!position)
      return res
        .status(404)
        .json({ success: false, message: "Position not found" });
    res.json({ success: true, data: position });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const updatePosition = async (req, res) => {
  try {
    const check = await prisma.position.findFirst({
      where: { id: req.params.id, companyId: req.user.companyId },
    });
    if (!check)
      return res
        .status(404)
        .json({ success: false, message: "Position not found" });

    const position = await prisma.position.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json({ success: true, data: position });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const deletePosition = async (req, res) => {
  try {
    const check = await prisma.position.findFirst({
      where: { id: req.params.id, companyId: req.user.companyId },
    });
    if (!check)
      return res
        .status(404)
        .json({ success: false, message: "Position not found" });

    await prisma.position.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: "Position deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  createPosition,
  getPositions,
  getPositionById,
  updatePosition,
  deletePosition,
};
