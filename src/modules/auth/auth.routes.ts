import { Router } from "express";
import { register, login, logout, me, refresh } from "./auth.controller";


const router = Router();

router.post('/register', register)
router.post('/login', login)
router.post('/refresh', refresh)
router.post('/logout', logout)
router.get('/me', me)

export default router;