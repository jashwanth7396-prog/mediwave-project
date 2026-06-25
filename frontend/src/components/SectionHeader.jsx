const SectionHeader = ({ title, subtitle }) => (
  <div className="mb-5 flex flex-col gap-2">
    <p className="text-sm uppercase tracking-[0.24em] text-slate-500">{subtitle}</p>
    <h2 className="text-3xl font-semibold text-slate-900">{title}</h2>
  </div>
);

export default SectionHeader;
