import multer from 'multer';

const photoMiddleware = multer({ dest: 'uploads/' });

export default photoMiddleware;