export default function Grid(props) {
    return (
        <svg aria-hidden="false" width="20" height="20" viewBox="2 2 20 20" {...props}>
            <path d="M0 0h24v24H0z" fill="none"/>
            <path d="M4 11h5V5H4v6zm0 7h5v-6H4v6zm6 0h5v-6h-5v6zm6 0h5v-6h-5v6zm-6-7h5V5h-5v6zm6-6v6h5V5h-5z"/>
        </svg>
    );
}
