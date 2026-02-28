import { useState } from "react";

export default function InputField({
    label,
    type = "text",
    placeholder,
    rightElement,
    ...props
}) {
    const [show, setShow] = useState(false);

    const isPassword = type === "password";

    return (
        <div>
            <div className="flex justify-between items-center">
                <label className="text-[#9FB7C8] text-sm">{label}</label>
                {rightElement}
            </div>

            <div className="relative mt-1">
                <input
                    type={isPassword && show ? "text" : type}
                    name={props.name}
                    value={props.value}
                    onChange={props.onChange}
                    placeholder={placeholder}
                    className="w-full px-4 py-2 rounded-lg bg-[#0E2F5A] text-white border border-[#135C8C] focus:outline-none focus:ring-2 focus:ring-[#135C8C]"
                />

                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShow(!show)}
                        className="absolute right-3 top-2 text-[#9FB7C8] text-sm"
                    >
                        {show ? "Hide" : "Show"}
                    </button>
                )}
            </div>
        </div>
    );
}