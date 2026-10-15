const Message = ({ variant = 'info', children }) => {
    if (!children) return null;
    return <div className={`message message-${variant}`}>{children}</div>;
};

export default Message;