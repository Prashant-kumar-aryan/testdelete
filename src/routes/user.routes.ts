import express from 'express';
import { getUsers,updateUsers,passwordUpdate } from '../controllers/user.controller';
import multer from 'multer';

const router = express.Router();

router.use((req, res, next) => {
  console.log(`Request received: ${req.method} ${req.originalUrl}`);
  console.log('Request body:', req.body);
  console.log('Query params:', req.query);
  console.log('Headers:', req.headers);
  next(); // Pass control to the next middleware or route handler
});

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
