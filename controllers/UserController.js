const prisma = require("../prisma/client/index");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");

const createUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ success: false, errors: errors.array() });

    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = await prisma.user.create({
            data: {
                fullName: req.body.fullName,
                email: req.body.email,
                password: hashedPassword,
                role: req.body.role,
                companyId: req.user.companyId 
            }
        });
        const { password, ...userWithoutPassword } = user;
        res.status(201).json({ success: true, data: userWithoutPassword });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const getUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            where: { companyId: req.user.companyId },
            select: { id: true, fullName: true, email: true, role: true, createdAt: true }
        });
        res.json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const getUserById = async (req, res) => {
    try {
        const user = await prisma.user.findFirst({
            where: { id: req.params.id, companyId: req.user.companyId }
        });
        if (!user) return res.status(404).json({ success: false, message: "User not found" });
        const { password, ...userWithoutPassword } = user;
        res.json({ success: true, data: userWithoutPassword });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const deleteUser = async (req, res) => {
    try {
        const user = await prisma.user.findFirst({
            where: { id: req.params.id, companyId: req.user.companyId }
        });
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        await prisma.user.delete({ where: { id: req.params.id } });
        res.json({ success: true, message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

module.exports = { createUser, getUsers, getUserById, deleteUser };