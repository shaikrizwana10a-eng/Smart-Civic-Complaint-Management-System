import { Router, type IRouter } from "express";
import healthRouter from "./health";
import complaintsRouter from "./complaints";
import adminRouter from "./admin";
import analyticsRouter from "./analytics";

const router: IRouter = Router();

router.use(healthRouter);
router.use(complaintsRouter);
router.use(adminRouter);
router.use(analyticsRouter);

export default router;
