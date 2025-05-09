import express from 'express';
import { getUsers,updateUsers,passwordUpdate } from '../controllers/user.controller';
import multer from 'multer';

const router = express.Router();

// Setup Multer
const storage = multer.memoryStorage();
const upload = multer({ storage });
router.get('/:userid', getUsers);
router.put(
  '/:userid',
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'certificate', maxCount: 5 }
  ]),
  updateUsers
);
router.put("/password/:userid",passwordUpdate);

export default router;
