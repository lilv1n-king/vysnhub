import { Request, Response, NextFunction } from 'express';
import { CreateUserData, UpdateUserData } from '../models/User';
import { CreateProjectData, UpdateProjectData } from '../models/Project';

// ⚠️ SICHERHEITS-VALIDIERUNG: Erweiterte Validierungs-Helpers
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && email.length <= 254;
};

const isValidPassword = (password: string): boolean => {
  // 🔒 SICHERHEITS-UPDATE: Starke Passwort-Policy
  if (!password || password.length < 8) {
    return false; // Mindestens 8 Zeichen
  }
  
  // Prüfe Komplexitätsanforderungen
  const hasLowerCase = /[a-z]/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  // Mindestens 3 von 4 Kategorien erforderlich
  const complexity = [hasLowerCase, hasUpperCase, hasNumbers, hasSpecialChar].filter(Boolean).length;
  
  return complexity >= 3;
};

// HTML-Escape für XSS-Schutz
const sanitizeHtml = (input: string): string => {
  if (typeof input !== 'string') return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};

// SQL-Injection-Schutz
const sanitizeSQL = (input: string): string => {
  if (typeof input !== 'string') return '';
  return input.replace(/'/g, "''").replace(/;/g, '');
};

// Script-Tags entfernen
const removeScripts = (input: string): string => {
  if (typeof input !== 'string') return '';
  return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
};

// Allgemeine Input-Bereinigung
const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  let sanitized = input.trim();
  sanitized = removeScripts(sanitized);
  sanitized = sanitizeHtml(sanitized);
  return sanitized.substring(0, 1000); // Längen-Begrenzung
};

// Auth validation
export const validateRegistration = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { email, password, first_name, last_name }: CreateUserData = req.body;

  const errors: string[] = [];

  // Email-Validierung mit Sanitization
  const sanitizedEmail = sanitizeInput(email || '').toLowerCase();
  if (!sanitizedEmail || !isValidEmail(sanitizedEmail)) {
    errors.push('Gültige E-Mail-Adresse ist erforderlich');
  }

  // Passwort-Validierung (starke Sicherheitsanforderungen)
  if (!password || !isValidPassword(password)) {
    errors.push('Passwort muss mindestens 8 Zeichen enthalten und 3 von 4 Kategorien (Kleinbuchstaben, Großbuchstaben, Zahlen, Sonderzeichen) erfüllen');
  }

  // Name-Validierung mit Sanitization
  const sanitizedFirstName = sanitizeInput(first_name || '');
  if (!sanitizedFirstName || sanitizedFirstName.length === 0) {
    errors.push('Vorname ist erforderlich');
  }

  const sanitizedLastName = sanitizeInput(last_name || '');
  if (!sanitizedLastName || sanitizedLastName.length === 0) {
    errors.push('Nachname ist erforderlich');
  }

  if (errors.length > 0) {
    res.status(400).json({ 
      success: false,
      error: 'Validierung fehlgeschlagen',
      details: errors 
    });
    return;
  }

  // Sanitierte Werte zurück in req.body schreiben
  req.body.email = sanitizedEmail;
  req.body.first_name = sanitizedFirstName;
  req.body.last_name = sanitizedLastName;

  next();
};

// Login validation entfernt - Login erfolgt direkt über Supabase im Frontend

export const validateUserUpdate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { first_name, last_name }: UpdateUserData = req.body;

  const errors: string[] = [];

  if (first_name !== undefined && first_name.trim().length === 0) {
    errors.push('First name cannot be empty');
  }

  if (last_name !== undefined && last_name.trim().length === 0) {
    errors.push('Last name cannot be empty');
  }

  if (errors.length > 0) {
    res.status(400).json({ 
      error: 'Validation failed',
      details: errors 
    });
    return;
  }

  next();
};

// Project validation
export const validateProjectCreation = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { project_name, status, priority }: CreateProjectData = req.body;

  const errors: string[] = [];

  if (!project_name || project_name.trim().length === 0) {
    errors.push('Project name is required');
  }

  const validStatuses = ['planning', 'active'];
  if (status && !validStatuses.includes(status)) {
    errors.push('Status must be either "planning" or "active"');
  }

  const validPriorities = ['low', 'medium', 'high', 'urgent'];
  if (priority && !validPriorities.includes(priority)) {
    errors.push('Priority must be one of: low, medium, high, urgent');
  }

  if (errors.length > 0) {
    res.status(400).json({ 
      error: 'Validation failed',
      details: errors 
    });
    return;
  }

  next();
};

export const validateProjectUpdate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { project_name, status, priority }: UpdateProjectData = req.body;

  const errors: string[] = [];

  if (project_name !== undefined && project_name.trim().length === 0) {
    errors.push('Project name cannot be empty');
  }

  const validStatuses = ['planning', 'active', 'completed', 'on_hold', 'cancelled'];
  if (status && !validStatuses.includes(status)) {
    errors.push('Invalid status provided');
  }

  const validPriorities = ['low', 'medium', 'high', 'urgent'];
  if (priority && !validPriorities.includes(priority)) {
    errors.push('Priority must be one of: low, medium, high, urgent');
  }

  if (errors.length > 0) {
    res.status(400).json({ 
      error: 'Validation failed',
      details: errors 
    });
    return;
  }

  next();
};