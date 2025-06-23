import React from 'react';

export const PlayIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg fill="currentColor" viewBox="0 0 20 20" {...props}>
    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"></path>
  </svg>
);

export const StopIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg fill="currentColor" viewBox="0 0 20 20" {...props}>
    <path d="M5.25 3A2.25 2.25 0 003 5.25v9.5A2.25 2.25 0 005.25 17h9.5A2.25 2.25 0 0017 14.75v-9.5A2.25 2.25 0 0014.75 3h-9.5z"></path>
  </svg>
);

export const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg fill="currentColor" viewBox="0 0 20 20" {...props}>
    <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75H4.5a.75.75 0 000 1.5h11a.75.75 0 000-1.5H14A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.5.66 1.5 1.5V15h1.5V5.5A3 3 0 0010 2.5h-1V15h1.5V5.5c0-.84.66-1.5 1.5-1.5H10zM1.5 6.75A.75.75 0 012.25 6h15.5a.75.75 0 010 1.5H2.25A.75.75 0 011.5 6.75zM4.125 15.64A2.001 2.001 0 006.124 17h7.752a2.001 2.001 0 001.999-1.36l.75-5.25a.75.75 0 00-1.498-.214l-.75 5.25a.5.5 0 01-.5.35H6.124a.5.5 0 01-.5-.35l-.75-5.25a.75.75 0 00-1.498.214l.75 5.25z" clipRule="evenodd"></path>
  </svg>
);

export const DownloadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg fill="currentColor" viewBox="0 0 20 20" {...props}>
    <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z"></path>
    <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z"></path>
  </svg>
);

export const PinIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" {...props} >
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.75V16.5L12 14.25L7.5 16.5V3.75m9 0H7.5A2.25 2.25 0 005.25 6v13.5A2.25 2.25 0 007.5 21.75h9a2.25 2.25 0 002.25-2.25V6A2.25 2.25 0 0016.5 3.75z" />
  </svg>
);

interface PinnedIconProps extends React.SVGProps<SVGSVGElement> {
  title?: string;
}

export const PinnedIcon: React.FC<PinnedIconProps> = ({ title, ...rest }) => (
 <svg fill="currentColor" viewBox="0 0 20 20" {...rest}>
    {title && <title>{title}</title>}
    <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
 </svg>
);


export const CloseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg fill="currentColor" viewBox="0 0 20 20" {...props}>
    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"></path>
  </svg>
);

export const CheckCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg fill="currentColor" viewBox="0 0 20 20" {...props}>
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
  </svg>
);

export const LightBulbIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg fill="currentColor" viewBox="0 0 20 20" {...props}>
    <path d="M10 3.5A5.509 5.509 0 004.5 9c0 2.236.84 4.296 2.274 5.863C7.94 16.331 9.176 17 10 17s2.06-.669 3.226-2.137C14.66 13.296 15.5 11.236 15.5 9A5.509 5.509 0 0010 3.5zM6.658 13.623C6.236 13.225 6 12.68 6 12.164c0-1.428.847-2.67 2.065-3.328a.75.75 0 00.375-1.002C8.29 7.425 8 6.99 8 6.5a2 2 0 114 0c0 .49-.29.925-.44 1.334a.75.75 0 00.376 1.002C13.153 9.493 14 10.736 14 12.164c0 .517-.236 1.061-.658 1.459A3.488 3.488 0 0110 15a3.488 3.488 0 01-3.342-1.377z" />
    <path d="M8.5 17.5a.75.75 0 001.5 0V17h-1.5v.5z" />
  </svg>
);

export const DocumentTextIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg fill="currentColor" viewBox="0 0 20 20" {...props}>
    <path fillRule="evenodd" d="M4.25 2A1.75 1.75 0 002.5 3.75v12.5A1.75 1.75 0 004.25 18h11.5A1.75 1.75 0 0017.5 16.25V7.128a1.75 1.75 0 00-.513-1.242l-4.25-4.25A1.75 1.75 0 0011.628 1H4.25zM11.5 2.75v3.5h3.5L11.5 2.75zM4.5 16V4h6.25V8c0 .414.336.75.75.75h3.75v7.25H4.5z" clipRule="evenodd" />
  </svg>
);

export const ChatBubbleBottomCenterTextIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg fill="currentColor" viewBox="0 0 20 20" {...props}>
    <path fillRule="evenodd" d="M2.5 5.5A2.5 2.5 0 015 3h10a2.5 2.5 0 012.5 2.5v5A2.5 2.5 0 0115 13H8.055l-2.28 1.954A.75.75 0 015 14.449V13H5a2.5 2.5 0 01-2.5-2.5v-5zm1.5.5v4.5a1 1 0 001 1h10a1 1 0 001-1v-4.5a1 1 0 00-1-1H5a1 1 0 00-1 1zm2 .75a.75.75 0 01.75-.75h4.5a.75.75 0 010 1.5h-4.5a.75.75 0 01-.75-.75zm0 2.5a.75.75 0 01.75-.75h2.5a.75.75 0 010 1.5h-2.5a.75.75 0 01-.75-.75z" clipRule="evenodd" />
  </svg>
);

export const MicrophoneOffIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.631.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
    </svg>
);

export const BugIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg fill="currentColor" viewBox="0 0 20 20" {...props}>
    <path fillRule="evenodd" d="M10 2a.75.75 0 01.75.75V4h1.55a1.45 1.45 0 011.233.729l.267.534A21.119 21.119 0 0115 7.5c0 .38-.026.753-.075 1.12L16.7 10.4a.75.75 0 01-1.4.4L13.67 9.2A19.06 19.06 0 0010.5 9h-1c-1.312 0-2.578.146-3.791.421L4.19 11.233A.75.75 0 112.96 9.98l1.317-1.464A20.216 20.216 0 014 7.5c0-.877.098-1.732.28-2.553l.267-.534A1.45 1.45 0 015.779 4H7.25V2.75A.75.75 0 018 2h2zm-4.75 7a.75.75 0 000 1.5h9.5a.75.75 0 000-1.5h-9.5zm-.41-3.665A20.216 20.216 0 014 7.5c0 .59.034 1.171.1 1.738l.102.996a.75.75 0 001.4-.142L5.5 9.096A18.732 18.732 0 0010 8.5h.008c1.947 0 3.821.289 5.542.835l.1.058a.75.75 0 00.505-1.378l-.103-.06A20.233 20.233 0 0110.008 7h-.016A18.718 18.718 0 006.01 7.788l-.12-.24A.75.75 0 004.84 5.335zM12 11.25a.75.75 0 01.75.75v4a.75.75 0 01-1.5 0v-4a.75.75 0 01.75-.75zm-4.5-.75a.75.75 0 00-.75.75v4a.75.75 0 001.5 0v-4a.75.75 0 00-.75-.75z" clipRule="evenodd" />
  </svg>
);

export const ConnectingIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="animate-spin" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
  </svg>
);


// New icons for Tile categories if needed, or adjust existing ones
export const ActionItemIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 4.5h16.5m-16.5-9h16.5" />
  </svg>
);

export const QuestionIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
 <svg fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" {...props}>
  <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
</svg>
);

export const ObservationIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
 <svg fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" {...props}>
  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
</svg>
);