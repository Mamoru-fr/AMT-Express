'use client';

import { useTranslation } from 'react-i18next';

export default function CGV() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            {t('legal.cgv.title', 'Conditions Générales de Vente')}
          </h1>
          <p className="text-sm text-gray-600 mb-2">
            {t('legal.lastUpdated', 'Dernière mise à jour : ')} {new Date().toLocaleDateString('fr-FR')}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
            {t('legal.cgv.article1.title', 'Article 1 - Objet')}
          </h2>
          <p className="text-gray-700">
            {t('legal.cgv.article1.description', 
              'Les présentes conditions générales de vente ont pour objet de définir les droits et obligations des parties dans le cadre de la réservation et de l\'exécution des services de transport proposés par AMT Express.')}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
            {t('legal.cgv.article2.title', 'Article 2 - Réservation')}
          </h2>
          <p className="text-gray-700">
            {t('legal.cgv.article2.description', 
              'Toute réservation est effectuée par le client via la plateforme en ligne ou par téléphone. La réservation est confirmée par l\'envoi d\'un email ou d\'un SMS de confirmation contenant les détails du trajet.')}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
            {t('legal.cgv.article3.title', 'Article 3 - Tarifs')}
          </h2>
          <p className="text-gray-700">
            {t('legal.cgv.article3.description', 
              'Les tarifs sont indiqués sur la plateforme et s\'entendent toutes taxes comprises. Ils peuvent varier en fonction de la durée du trajet, de la distance parcourue et des éventuelles options choisies.')}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
            {t('legal.cgv.article4.title', 'Article 4 - Paiement')}
          </h2>
          <p className="text-gray-700">
            {t('legal.cgv.article4.description', 
              'Le paiement s\'effectue conformément aux modalités indiquées lors de la réservation. Plusieurs moyens de paiement sont acceptés : carte bancaire, espèces, etc.')}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
            {t('legal.cgv.article5.title', 'Article 5 - Annulation')}
          </h2>
          <p className="text-gray-700">
            {t('legal.cgv.article5.description', 
              'Toute annulation doit être signalée au minimum 24 heures avant l\'heure prévue de départ. Passé ce délai, des frais d\'annulation pourront être appliqués.')}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
            {t('legal.cgv.article6.title', 'Article 6 - Responsabilités')}
          </h2>
          <p className="text-gray-700 mb-4">
            {t('legal.cgv.article6.description', 
              'AMT Express décline toute responsabilité en cas de retard ou d\'annulation imputable à des raisons indépendantes de sa volonté (conditions météorologiques, circulation, etc.).')}
          </p>
          <p className="text-gray-700">
            {t('legal.cgv.article6.limitation', 
              'En cas de litige, les tribunaux compétents seront ceux du siège social de l\'entreprise.')}
          </p>
        </div>
      </div>
    </div>
  );
}
