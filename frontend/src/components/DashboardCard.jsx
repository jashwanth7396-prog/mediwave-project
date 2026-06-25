import { motion } from 'framer-motion';
import CountUp from './CountUp.jsx';

const DashboardCard = ({ title, value, accent, icon, description, format }) => (
  <motion.div
    className={`glass-card overflow-hidden rounded-[28px] p-6 ${accent} transition-transform hover:-translate-y-1`}
    whileHover={{ y: -6 }}
    transition={{ duration: 0.25 }}
  >
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-sm uppercase tracking-[0.24em] text-slate-500">{title}</p>
        <h3 className="mt-3 text-3xl font-semibold text-slate-900">
          <CountUp value={value} format={format} />
        </h3>
      </div>
      <div className="inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-white/90 text-slate-900 shadow-md">
        {icon}
      </div>
    </div>
    {description && <p className="mt-4 text-sm leading-6 text-slate-500">{description}</p>}
  </motion.div>
);

export default DashboardCard;
