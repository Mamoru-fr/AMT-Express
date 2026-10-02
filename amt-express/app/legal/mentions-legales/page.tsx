import { useTranslation } from 'react-i18next';

/* eslint-disable react/no-unescaped-entities */
export default function MentionsLegales() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            {t('legal.mentionsLegales.title', 'Mentions Légales')}
          </h1>
          <p className="text-sm text-gray-600 mb-2">
            {t('legal.lastUpdated', 'Dernière mise à jour : ')} {new Date().toLocaleDateString('fr-FR')}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
            {t('legal.mentionsLegales.editeur.title', 'Éditeur du site')}
          </h2>
          <p className="text-gray-700 mb-2">
            <strong>{t('legal.mentionsLegales.editeur.name', 'Nom :')}</strong> AMT Express
          </p>
          <p className="text-gray-700 mb-2">
            <strong>{t('legal.mentionsLegales.editeur.address', 'Adresse :')}</strong> [Adresse à compléter]
          </p>
          <p className="text-gray-700 mb-2">
            <strong>{t('legal.mentionsLegales.editeur.phone', 'Téléphone :')}</strong> [Numéro à compléter]
          </p>
          <p className="text-gray-700 mb-2">
            <strong>{t('legal.mentionsLegales.editeur.email', 'Email :')}</strong> contact@amt-express.com
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
            {t('legal.mentionsLegales.hebergement.title', 'Hébergement')}
          </h2>
          <p className="text-gray-700 mb-2">
            <strong>{t('legal.mentionsLegales.hebergement.provider', 'Hébergeur :')}</strong> [Nom de l'hébergeur]
          </p>
          <p className="text-gray-700 mb-2">
            <strong>{t('legal.mentionsLegales.hebergement.address', 'Adresse :')}</strong> [Adresse de l'hébergeur]
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
            {t('legal.mentionsLegales.donneesPersonnelles.title', 'Données personnelles')}
          </h2>
          <p className="text-gray-700 mb-4">
            {t('legal.mentionsLegales.donneesPersonnelles.description', 
              'Conformément à la loi n° 78-17 du 6 janvier 1978 relative à linformatique, aux fichiers et aux libertés, les utilisateurs du site disposent dun droit daccès, de rectification et de suppression des données personnelles les concernant.')}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
            {t('legal.mentionsLegales.droitAuteurs.title', 'Droits d\'auteur')}
          </h2>
          <p className="text-gray-700 mb-2">
            {t('legal.mentionsLegales.droitAuteurs.description', 'Lensemble du contenu du site AMT Express (textes, images, logos, etc.) est Protégé par les lois françaises et internationales sur le droit dauteur et la propriété intellectuelle.')}
          </p>
          <p className="text-gray-700">
            {t('legal.mentionsLegales.droitAuteurs.reserved', 'Toute reproduction totale ou partielle de ce site est strictement interdite sans autorisation expresse.')}
          </p>
        </div>
      </div>
    </div>
  );
}
