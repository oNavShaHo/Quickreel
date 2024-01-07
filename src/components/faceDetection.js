
import { motion } from "framer-motion"

 const faceDetection = () => (
  <div className="flex justify-center items-center ">
  <motion.div
  initial={{
    x:  -200,
    opacity: 0,
  }}
  transition={{ duration: 1 }}
  whileInView={{ opacity: 1, x: 0 }}
    animate={{ opacity: 1, scale: 1 }}
   
    className="flex flex-col items-center justify-start w-screen text-4xl font-bold mt-4 text-orange-500"
  >Face Detection </motion.div>

  </div>
)
export default faceDetection