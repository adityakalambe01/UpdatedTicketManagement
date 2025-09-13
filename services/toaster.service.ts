import { toast } from "sonner"

type ToastType = "success" | "error" | "info" | "warning" | "default"

interface ToastOptions {
	description?: string
	duration?: number
	dismissible?: boolean
	action?: {
		label: string
		onClick: () => void
	}
}

export class ToastService {
	static show(type: ToastType, message: string, options?: ToastOptions) {
		const baseOptions = {
			description: options?.description,
			duration: options?.duration ?? 3000,
			dismissible: options?.dismissible ?? true,
			action: options?.action,
		}

		switch (type) {
			case "success":
				toast.success(message, baseOptions)
				break
			case "error":
				toast.error(message, baseOptions)
				break
			case "info":
				toast.info(message, baseOptions)
				break
			case "warning":
				toast(message, {
					...baseOptions,
					icon: "⚠️",
				})
				break
			case "default":
			default:
				toast(message, baseOptions)
				break
		}
	}

	static success(message: string, options?: ToastOptions) {
		this.show("success", message, options)
	}

	static error(message: string, options?: ToastOptions) {
		this.show("error", message, options)
	}

	static info(message: string, options?: ToastOptions) {
		this.show("info", message, options)
	}

	static warning(message: string, options?: ToastOptions) {
		this.show("warning", message, options)
	}

	static default(message: string, options?: ToastOptions) {
		this.show("default", message, options)
	}
}