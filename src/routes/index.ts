import { Router } from "express";
import productRoutes from "./product.routes";
import notificationRouter from "./notification.routes";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    data: {
      status: "ok",
    },
  });
});

router.use("/products", productRoutes);
router.use("/notifications", notificationRouter);

export default router;
