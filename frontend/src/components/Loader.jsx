const Loader = () => {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-primary-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-primary-600 font-medium">Đang tải dữ liệu...</p>
      </div>
    </div>
  );
};

export default Loader;
