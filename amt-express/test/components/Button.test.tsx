import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/classicComponents/Button';

// Mock de cn pour les tests
vi.mock('@/utils/cn', () => ({
  cn: (...classes: string[]) => classes.join(' '),
}));

describe('Button Component [UNIT]', () => {
  // =============================================
  // Tests 1 : Rendering de base
  // =============================================
  describe('Basic Rendering', () => {
    it('should render with content', () => {
      render(<Button content="Click me" />);
      expect(screen.getByRole('button', { name: /Click me/i })).toBeInTheDocument();
    });

    it('should render as a button element', () => {
      render(<Button content="Submit" />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should display the provided content', () => {
      render(<Button content="Custom Text" />);
      expect(screen.getByText('Custom Text')).toBeInTheDocument();
    });
  });

  // =============================================
  // Tests 2 : Props
  // =============================================
  describe('Props', () => {
    it('should apply primary variant class by default', () => {
      render(<Button content="Primary" />);
      const button = screen.getByRole('button', { name: /Primary/i });
      // Vérifie que la classe buttonPrimary est appliquée (via mock de cn)
      expect(button.className).toContain('buttonPrimary');
    });

    it('should apply secondary variant class when specified', () => {
      render(<Button content="Secondary" variant="secondary" />);
      const button = screen.getByRole('button', { name: /Secondary/i });
      expect(button.className).toContain('buttonSecondary');
    });

    it('should apply custom className', () => {
      render(<Button content="Custom" className="my-class" />);
      const button = screen.getByRole('button', { name: /Custom/i });
      expect(button.className).toContain('my-class');
    });

    it('should apply both base, variant, and custom classes', () => {
      render(<Button content="All Classes" variant="secondary" className="custom" />);
      const button = screen.getByRole('button', { name: /All Classes/i });
      expect(button.className).toContain('button');
      expect(button.className).toContain('buttonSecondary');
      expect(button.className).toContain('custom');
    });

    it('should default to button type', () => {
      render(<Button content="Default Type" />);
      const button = screen.getByRole('button', { name: /Default Type/i });
      expect(button.type).toBe('button');
    });

    it('should accept custom type', () => {
      render(<Button content="Submit" type="submit" />);
      const button = screen.getByRole('button', { name: /Submit/i });
      expect(button.type).toBe('submit');
    });

    it('should default to not disabled', () => {
      render(<Button content="Enabled" />);
      const button = screen.getByRole('button', { name: /Enabled/i });
      expect(button.disabled).toBe(false);
    });

    it('should accept disabled prop', () => {
      render(<Button content="Disabled" disabled={true} />);
      const button = screen.getByRole('button', { name: /Disabled/i });
      expect(button.disabled).toBe(true);
    });
  });

  // =============================================
  // Tests 3 : Comportement
  // =============================================
  describe('Behavior', () => {
    it('should call onClick when clicked', () => {
      const handleClick = vi.fn();
      render(<Button content="Clickable" onClick={handleClick} />);
      
      const button = screen.getByRole('button', { name: /Clickable/i });
      button.click();
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick when disabled', () => {
      const handleClick = vi.fn();
      render(<Button content="Disabled" onClick={handleClick} disabled={true} />);
      
      const button = screen.getByRole('button', { name: /Disabled/i });
      button.click();
      
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should have button role', () => {
      render(<Button content="Role Test" />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  // =============================================
  // Tests 4 : Accessibilité
  // =============================================
  describe('Accessibility', () => {
    it('should have button role', () => {
      render(<Button content="Accessible" />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should accept aria-label', () => {
      render(<Button content="Icon" aria-label="Icon Button" />);
      expect(screen.getByLabelText('Icon Button')).toBeInTheDocument();
    });
  });
});
