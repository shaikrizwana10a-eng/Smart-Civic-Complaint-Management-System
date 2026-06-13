import { Router, type IRouter } from "express";
import healthRouter from "./health";
import complaintsRouter from "./complaints";
import adminRouter from "./admin";
import analyticsRouter from "./analytics";
import uploadRouter from "./upload";

const router: IRouter = Router();

router.use(healthRouter);
router.use(complaintsRouter);
router.use(adminRouter);
router.use(analyticsRouter);
router.use(uploadRouter);

export default router;
