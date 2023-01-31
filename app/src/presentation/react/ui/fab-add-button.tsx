export const AddFab = (props: {
	onClick: () => void
	label: string
}): JSX.Element => (
	<button
		onClick={props.onClick}
		type="button"
		className="text-white bg-primary fixed right-7 bottom-12 z-10 focus:ring-4 focus:outline-none font-medium rounded-full text-lg p-3 text-center inline-flex items-center"
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="currentColor"
			className="w-6 h-6"
		>
			<path
				fill-rule="evenodd"
				d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z"
				clip-rule="evenodd"
			/>
		</svg>
		<span className="sr-only">{props.label}</span>
	</button>
)
