import React from "react";

function Footer() {
    return (
        <footer className="bg-gray-800 text-center text-white p-4 mt-auto">
        © {new Date().getFullYear()} Expense Manager | All Rights Reserved
    </footer>
    );
}

export default Footer;