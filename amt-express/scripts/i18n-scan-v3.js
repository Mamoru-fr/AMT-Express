#!/usr/bin/env node

/**
 * Script V3 pour scanner UNIQUEMENT les textes UI réels à traduire
 * 
 * Stratégie: 
 * 1. Extraire TOUT le texte entre balises JSX et dans les props textuelles
 * 2. Filtrer agressivement avec shouldIgnore pour éliminer:
 *    - Classes Tailwind/CSS
 *    - Noms de variables, types, composants
 *    - Code JavaScript/TypeScript
 *    - Props techniques
 */

const fs = require('fs');
const path = require('path');

// Configuration
const PROJECT_ROOT = path.join(__dirname, '..');
const LOCALES_DIR = path.join(PROJECT_ROOT, 'locales');
const EXCLUDE_DIRS = ['node_modules', '.next', '.git', 'test', 'scripts', 'lib', 'services', 'content', 'context', 'drizzle'];
const FILE_EXTENSIONS = ['.tsx'];

// Props qui contiennent du texte UI réel
const TEXT_PROPS = new Set([
    'title', 'subtitle', 'label', 'placeholder', 'alt', 'aria-label',
    'aria-description', 'description', 'helperText', 'emptyText', 'message',
    'eyebrow', 'text', 'content', 'children', 'defaultValue', 'hint',
    'legend', 'caption', 'summary', 'name'
]);

// Dictionnaire des traductions existantes
let existingTranslations = {};
let allExistingTexts = new Set();

/**
 * Charge les traductions existantes
 */
function loadExistingTranslations() {
    const enPath = path.join(LOCALES_DIR, 'en.json');
    const frPath = path.join(LOCALES_DIR, 'fr.json');
    
    if (fs.existsSync(enPath)) {
        const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
        existingTranslations.en = en;
        flattenAndAdd(en, allExistingTexts);
    }
    
    if (fs.existsSync(frPath)) {
        const fr = JSON.parse(fs.readFileSync(frPath, 'utf8'));
        existingTranslations.fr = fr;
    }
}

/**
 * Aplatit un objet et ajoute tous les textes à un Set
 */
function flattenAndAdd(obj, set) {
    for (const key in obj) {
        const value = obj[key];
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            flattenAndAdd(value, set);
        } else if (typeof value === 'string') {
            set.add(value.toLowerCase().trim());
        }
    }
}

/**
 * Nettoie un texte
 */
function cleanText(text) {
    return text
        .replace(/\\n/g, '\n')
        .replace(/\\t/g, '\t')
        .replace(/\\'/g, "'")
        .replace(/\\"/g, '"')
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Vérifie si un texte est une classe Tailwind ou CSS
 */
function isTailwindOrCSS(text) {
    // Si le texte contient uniquement des classes séparées par des espaces
    // et que chaque partie ressemble à une classe CSS
    const parts = text.split(' ').filter(p => p.length > 0);
    
    // Si toutes les parties sont des identifiants CSS valides
    const allPartsAreCSS = parts.every(part => {
        // Une classe CSS: commence par une lettre, contient des lettres, chiffres, tirets, underscores
        // Tailwind: souvent avec des tirets, préfixes connus
        if (!/^[a-zA-Z]/.test(part)) return false;
        if (!/^[a-zA-Z0-9_-]+$/.test(part)) return false;
        
        // Vérifier les préfixes Tailwind courants
        const tailwindPrefixes = ['bg-', 'text-', 'p-', 'm-', 'w-', 'h-', 'flex', 'grid', 'rounded', 'shadow',
                                   'border', 'hover:', 'focus:', 'active:', 'md:', 'lg:', 'sm:', 'xl:',
                                   'font-', 'uppercase', 'lowercase', 'capitalize', 'truncate',
                                   'overflow-', 'justify-', 'items-', 'space-', 'gap-', 'divide-',
                                   'min-', 'max-', 'inset-', 'top-', 'bottom-', 'left-', 'right-'];
        
        if (tailwindPrefixes.some(p => part.startsWith(p) || part.includes(p))) {
            return true;
        }
        
        // Si c'est un identifiant CSS qui ressemble à un nom de classe
        // (contient des tirets, pas de majuscules sauf éventuellement au début)
        if (part.includes('-')) {
            return true;
        }
        
        return false;
    });
    
    return allPartsAreCSS && parts.length > 0;
}

/**
 * Vérifie si un texte doit être ignoré
 */
function shouldIgnore(text) {
    if (!text || text.length < 2) return true;
    
    // Ignorer les classes Tailwind/CSS
    if (isTailwindOrCSS(text)) return true;
    
    const lowerText = text.toLowerCase();
    
    // Ignorer les noms de props React courantes
    const reactProps = ['className', 'style', 'onClick', 'onChange', 'onSubmit', 'value', 'key', 'ref', 'children',
                       'onBlur', 'onFocus', 'onKeyDown', 'onMouseEnter', 'onMouseLeave', 'disabled', 'required',
                       'readOnly', 'autoFocus', 'tabIndex', 'role', 'aria-hidden', 'data-testid'];
    if (reactProps.includes(text)) return true;
    
    // Ignorer les mots réservés JavaScript/TypeScript
    const reservedWords = new Set([
        'useClient', 'useServer', 'export', 'import', 'from', 'const', 'let', 'var', 
        'function', 'class', 'interface', 'type', 'enum', 'return', 'if', 'else', 'for', 
        'while', 'try', 'catch', 'finally', 'throw', 'new', 'this', 'super', 'null', 'undefined',
        'true', 'false', 'string', 'number', 'boolean', 'any', 'void', 'Promise', 'Response',
        'Error', 'Date', 'JSON', 'RegExp', 'Array', 'Object', 'Function', 'React', 'FC',
        'MouseEvent', 'ChangeEvent', 'FormEvent', 'KeyboardEvent', 'HTMLAttributes',
        'ReactNode', 'ReactElement', 'ReactComponent', 'PropsWithChildren'
    ]);
    if (reservedWords.has(text)) return true;
    
    // Ignorer les paths
    if (text.startsWith('./') || text.startsWith('../') || text.startsWith('@/') || text.startsWith('/')) {
        return true;
    }
    
    // Ignorer les URLs
    if (text.includes('http://') || text.includes('https://') || text.includes('www.')) {
        return true;
    }
    
    // Ignorer les emails
    if (text.includes('@') && text.includes('.')) {
        return true;
    }
    
    // Ignorer les extensions de fichiers
    if (text.endsWith('.tsx') || text.endsWith('.ts') || text.endsWith('.jsx') || text.endsWith('.js')) {
        return true;
    }
    
    // Ignorer les valeurs numériques
    if (/^[0-9]+$/.test(text)) return true;
    
    // Ignorer les templates literals
    if (text.includes('${')) return true;
    
    // Ignorer les fragments de code
    if (text.includes('=>') || text.includes('...') || text.startsWith('...')) return true;
    
    // Ignorer les appels de fonction
    if (text.includes('(') || text.includes(')')) return true;
    
    // Ignorer les opérateurs
    if (/^[+\-*\/%=<>!&|^~]/.test(text)) return true;
    
    // Ignorer les noms de hooks React
    if (/^use[A-Z]/.test(text)) return true;
    
    // Ignorer les noms de composants (commencent par majuscule)
    if (/^[A-Z][a-zA-Z0-9]*$/.test(text) && text.length > 2) {
        const componentPatterns = ['Button', 'Input', 'Modal', 'Card', 'Table', 'Chart', 'Form', 
                                   'Select', 'Option', 'Dropdown', 'Navigation', 'Dashboard', 'Page',
                                   'Shell', 'Header', 'Footer', 'Sidebar', 'Menu', 'Item', 'List',
                                   'Icon', 'Image', 'Link', 'Text', 'Label', 'Badge', 'Alert', 'View',
                                   'Container', 'Wrapper', 'Section', 'Row', 'Col', 'Grid'];
        if (componentPatterns.some(p => text.includes(p)) || text.endsWith('Props') || text.endsWith('Data')) {
            return true;
        }
    }
    
    // Ignorer les noms de variables camelCase (ex: selectedDriver, rideId)
    if (/^[a-z][a-zA-Z0-9]*$/.test(text) && !text.includes(' ') && text.length > 3) {
        const codeLikePatterns = ['Id', 'Name', 'Time', 'Date', 'Data', 'Value', 'State', 'Props', 
                                   'Ref', 'Key', 'Type', 'Event', 'Handler', 'Error', 'Status', 'Count',
                                   'Length', 'Index', 'Item', 'User', 'Ride', 'Driver', 'Customer'];
        if (codeLikePatterns.some(p => text.includes(p) || text.endsWith(p))) {
            return true;
        }
    }
    
    // Ignorer les identifiants de style (ex: "connections-container")
    if (/^[a-z][a-zA-Z0-9-]*$/.test(text) && text.includes('-') && !text.includes(' ')) {
        return true;
    }
    
    // Ignorer les noms de styles (styles.something)
    if (text.startsWith('styles.') || text.includes('styles.')) return true;
    
    // Ignorer les objets de configuration
    if (text.includes(':') && !text.includes(' ')) return true;
    
    return false;
}

/**
 * Vérifie si un texte est déjà traduit
 */
function isAlreadyTranslated(text) {
    const lowerText = text.toLowerCase().trim();
    return allExistingTexts.has(lowerText);
}

/**
 * Extrait TOUS les textes des fichiers TSX
 * Puis filtre avec shouldIgnore
 */
function extractAllTextsFromContent(content) {
    const texts = new Set();
    
    // 1. Extraire le texte entre les balises JSX (enfants directs)
    // Pattern: <tag>text</tag> ou <tag>text</>
    // On capture le texte entre > et < qui n'est pas dans un attribut
    const jsxPattern = />([^<{]+?)<\//g;
    const jsxMatches = [...content.matchAll(jsxPattern)];
    
    for (const match of jsxMatches) {
        let text = match[1];
        // Si le texte contient des attributs (ex: " className=\"test\" "), les ignorer
        // On garde seulement la dernière partie avant le <
        if (text.includes('className=') || text.includes('style=') || text.includes('=')) {
            // Prendre uniquement la partie après le dernier > ou après le dernier "
            const lastQuote = Math.max(text.lastIndexOf('"'), text.lastIndexOf("'"));
            if (lastQuote > -1) {
                text = text.slice(lastQuote + 1);
            }
        }
        const cleaned = cleanText(text);
        if (cleaned && !/^\s*$/.test(cleaned)) {
            texts.add(cleaned);
        }
    }
    
    // 2. Extraire les valeurs des props textuelles (title, placeholder, etc.)
    for (const prop of TEXT_PROPS) {
        // Ne pas extraire className, style
        if (prop === 'className' || prop === 'style' || prop === 'children') continue;
        
        const pattern = new RegExp(`${prop}\\s*=\\s*['"]([^'"{}]+)['"]`, 'gi');
        const matches = [...content.matchAll(pattern)];
        
        for (const match of matches) {
            const text = cleanText(match[1]);
            if (text && !text.includes('{') && !text.includes('}')) {
                texts.add(text);
            }
        }
    }
    
    // 3. Extraire le contenu des balises <option>
    const optionPattern = /<option[^>]*>([^<{]+?)<\/option>/gi;
    const optionMatches = [...content.matchAll(optionPattern)];
    
    for (const match of optionMatches) {
        const text = cleanText(match[1]);
        if (text) {
            texts.add(text);
        }
    }
    
    // 4. Extraire le contenu des balises auto-fermantes avec texte: <input placeholder="..." />
    // Déjà couvert par les props
    
    return Array.from(texts);
}

/**
 * Analyse un fichier
 */
function analyzeFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(PROJECT_ROOT, filePath);
    
    // Extraire tous les textes
    const allTexts = extractAllTextsFromContent(content);
    
    // Filtrer avec shouldIgnore
    const validTexts = allTexts.filter(t => !shouldIgnore(t));
    
    // Filtrer ceux déjà traduits
    const missingTexts = validTexts.filter(t => !isAlreadyTranslated(t));
    
    return {
        file: relativePath,
        count: missingTexts.length,
        texts: missingTexts
    };
}

/**
 * Génère un rapport détaillé
 */
function generateReport(results) {
    console.log('='.repeat(80));
    console.log('📊 RAPPORT PRÉCIS D\'INTERNATIONALISATION V3 - AMT EXPRESS');
    console.log('='.repeat(80));
    
    const totalMissing = results.reduce((sum, r) => sum + r.count, 0);
    
    console.log(`\n📈 STATISTIQUES:`);
    console.log(`   Fichiers TSX analysés: ${results.length}`);
    console.log(`   Textes NON traduits: ${totalMissing}\n`);
    
    if (results.length === 0 || totalMissing === 0) {
        console.log('✅ TOUT EST TRADUIT!\n');
        return;
    }
    
    // Top 10
    console.log('🎯 TOP 10 FICHIERS AVEC TEXTES MANQUANTS:');
    console.log('-'.repeat(80));
    const top10 = results.slice(0, 10);
    top10.forEach((result, index) => {
        console.log(`   ${index + 1}. ${result.file} (${result.count} texte${result.count > 1 ? 's' : ''})`);
    });
    
    // Détails
    console.log('\n📄 TEXTES À TRADUIRE PAR FICHIER:');
    console.log('-'.repeat(80));
    
    results.forEach(result => {
        if (result.count > 0) {
            console.log(`\n📁 ${result.file} (${result.count} texte${result.count > 1 ? 's' : ''})`);
            result.texts.forEach((text, i) => {
                console.log(`   ${i + 1}. "${text}"`);
            });
        }
    });
    
    // Générer le JSON pour les traductions
    console.log('\n💡 SUGGESTIONS POUR en.json:');
    console.log('-'.repeat(80));
    console.log('// Copier cette structure dans locales/en.json\n');
    
    const suggestions = {};
    for (const result of results) {
        const fileName = path.basename(result.file, '.tsx');
        
        for (const text of result.texts) {
            if (!suggestions[fileName]) {
                suggestions[fileName] = {};
            }
            
            // Générer une clé camelCase
            const words = text.split(/[\s\-_]/).filter(w => w.length > 0);
            const camelCase = words.length > 0 ? 
                words[0].toLowerCase() + words.slice(1).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('') : 
                text.toLowerCase();
            
            suggestions[fileName][camelCase] = text;
        }
    }
    
    console.log(JSON.stringify(suggestions, null, 2));
    
    // Sauvegarder dans un fichier
    const reportDir = path.join(PROJECT_ROOT, 'scripts', 'reports');
    if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
    }
    
    const report = {
        date: new Date().toISOString(),
        stats: {
            filesAnalyzed: results.length,
            totalMissing,
        },
        top10,
        suggestions,
        details: results,
    };
    
    fs.writeFileSync(
        path.join(reportDir, 'i18n-scan-v3-report.json'),
        JSON.stringify(report, null, 2)
    );
    
    console.log(`\n✅ Rapport détaillé sauvé dans: scripts/reports/i18n-scan-v3-report.json`);
    console.log('='.repeat(80));
}

/**
 * Scanner les fichiers récursivement
 */
function scanFiles(dir, fileList = []) {
    if (!fs.existsSync(dir)) return fileList;
    
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            if (!EXCLUDE_DIRS.includes(file)) {
                scanFiles(fullPath, fileList);
            }
        } else if (FILE_EXTENSIONS.includes(path.extname(file))) {
            // Vérifier que le fichier est bien un composant React
            const fileContent = fs.readFileSync(fullPath, 'utf8');
            if (fileContent.includes('use client') || fileContent.includes('useClient') || fileContent.match(/<[a-z]/i)) {
                fileList.push(fullPath);
            }
        }
    }
    
    return fileList;
}

/**
 * Analyse principale
 */
function main() {
    console.log('🔍 Démarrage de l\'analyse i18n V3...\n');
    
    // Charger les traductions existantes
    loadExistingTranslations();
    const enKeys = existingTranslations.en ? Object.keys(existingTranslations.en).length : 0;
    const frKeys = existingTranslations.fr ? Object.keys(existingTranslations.fr).length : 0;
    console.log(`✅ Traductions existantes chargées: ${enKeys} clés (EN), ${frKeys} clés (FR)\n`);
    
    // Scanner tous les fichiers TSX
    const allFiles = scanFiles(PROJECT_ROOT);
    console.log(`📁 Fichiers TSX trouvés: ${allFiles.length}\n`);
    
    // Analyser chaque fichier
    const results = [];
    
    for (const filePath of allFiles) {
        try {
            const result = analyzeFile(filePath);
            if (result.count > 0) {
                results.push(result);
            }
        } catch (error) {
            console.warn(`⚠️ Erreur lors de l'analyse de ${filePath}: ${error.message}`);
        }
    }
    
    // Trier par nombre de textes manquants
    results.sort((a, b) => b.count - a.count);
    
    // Générer le rapport
    generateReport(results);
}

// Exécuter
try {
    main();
} catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error(error.stack);
    process.exit(1);
}
