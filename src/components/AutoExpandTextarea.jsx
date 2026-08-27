import React, { useRef, useEffect } from 'react';

export default function AutoExpandTextarea({
  value = '',
  onChange,
  onBlur,
  placeholder = '',
  className = '',
  minHeight = 46,
  maxHeight = 260, // ~30-40% screen viewport height limit
  ...props
}) {
  const textareaRef = useRef(null);

  const adjustHeight = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const scrollH = el.scrollHeight;
    const computedH = Math.min(Math.max(scrollH, minHeight), maxHeight);
    el.style.height = `${computedH}px`;
    el.style.overflowY = scrollH > maxHeight ? 'auto' : 'hidden';
  };

  useEffect(() => {
    adjustHeight();
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => {
        if (onChange) onChange(e);
        adjustHeight();
      }}
      onBlur={onBlur}
      placeholder={placeholder}
      className={className}
      rows={1}
      style={{
        minHeight: `${minHeight}px`,
        maxHeight: `${maxHeight}px`,
        resize: 'none',
        transition: 'height 0.12s ease-out'
      }}
      {...props}
    />
  );
}
