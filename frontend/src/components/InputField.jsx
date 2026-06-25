const InputField = ({ label, name, register, required, type = 'text', error, placeholder }) => (
  <label className="space-y-2 text-sm font-medium text-slate-700">
    <span>{label}</span>
    <input
      type={type}
      placeholder={placeholder}
      {...register(name, { required })}
      className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
    />
    {error && <span className="text-sm text-red-500">{error.message}</span>}
  </label>
);

export default InputField;
