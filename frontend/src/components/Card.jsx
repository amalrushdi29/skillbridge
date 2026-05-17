const Card = ({ children, maxWidth = "max-w-4xl" }) => {
  return (
    <div className={`${maxWidth} mx-auto bg-white dark:bg-[#1E293B] rounded-2xl shadow p-8`}>
      {children}
    </div>
  );
};

export default Card;
