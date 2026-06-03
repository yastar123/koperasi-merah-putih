import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import koperasiRouter from "./koperasi";
import anggotaRouter from "./anggota";
import simpananRouter from "./simpanan";
import pinjamanRouter from "./pinjaman";
import angsuranRouter from "./angsuran";
import unitUsahaRouter from "./unit-usaha";
import produkRouter from "./produk";
import transaksiRouter from "./transaksi";
import laporanRouter from "./laporan";
import dashboardRouter from "./dashboard";
import aktivitasRouter from "./aktivitas";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(koperasiRouter);
router.use(anggotaRouter);
router.use(simpananRouter);
router.use(pinjamanRouter);
router.use(angsuranRouter);
router.use(unitUsahaRouter);
router.use(produkRouter);
router.use(transaksiRouter);
router.use(laporanRouter);
router.use(dashboardRouter);
router.use(aktivitasRouter);

export default router;
