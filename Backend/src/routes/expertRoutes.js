import { Router } from 'express'
import { getExpertById, listExperts } from '../controllers/expertController.js'

const router = Router()

router.get('/', listExperts)
router.get('/:id', getExpertById)

export default router
