import React from 'react'

const NotFound = () => {
  return (
    <>
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
            <h1 className="text-6xl font-bold text-gray-800 dark:text-gray-200">404</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">Page Not Found</p>
            <a href="/" className="mt-4 text-blue-500 hover:underline">Go back to Home</a>
        </div>
    </>
  )
}

export default NotFound