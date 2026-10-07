import { loginFields } from "../constants/login-fields.constant";

export function LoginFormSection() {
  return (
    <form className="mt-6 space-y-4">
      {loginFields.map((field) => (
        <label className="block" htmlFor={field.name} key={field.name}>
          <span className="text-sm font-medium">{field.label}</span>
          <input
            className="mt-2 h-11 w-full rounded-md border border-line bg-background px-3 text-sm outline-none focus:border-accent"
            id={field.name}
            name={field.name}
            placeholder={field.placeholder}
            type={field.type}
          />
        </label>
      ))}
      <button
        className="h-11 w-full rounded-md bg-accent px-4 text-sm font-semibold text-accent-foreground transition hover:bg-[#1f5f54]"
        type="button"
      >
        Sign in
      </button>
    </form>
  );
}
