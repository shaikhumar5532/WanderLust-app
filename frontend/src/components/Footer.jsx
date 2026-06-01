import React from 'react';
import { FaFacebook, FaInstagram, FaTwitter, FaLinkedin } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-socials">
        <FaFacebook />
        <FaInstagram />
        <FaTwitter />
        <FaLinkedin />
      </div>
      <div className="footer-links">
        <a href="#privacy" className="footer-link">Privacy</a>
        <a href="#terms" className="footer-link">Terms</a>
        <a href="#details" className="footer-link">Company Details</a>
      </div>
      <p>&copy; {new Date().getFullYear()} Wanderlust. All rights reserved.</p>
    </footer>
  );
}
