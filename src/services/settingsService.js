/**
 * AppleJuice Settings Service
 * Verwaltet die Kommunikation mit dem AppleJuice Core für Einstellungen
 */

import coreService from './coreService.js'
import { parseXmlToJson } from '../utils/xmlParser.js'

class SettingsService {
  constructor() {
    this.cache = new Map()
  }

  /**
   * Einstellungen vom Core abrufen
   * @returns {Promise<Object>} - Einstellungen
   */
  async getSettings() {
    try {
      // Daten vom Core abrufen
      const response = await coreService.command('xml', 'settings.xml')

      // Wenn wir bereits geparste Daten haben, diese zurückgeben
      if (response) {
        // Direkte Verarbeitung der XML-Struktur
        // Beispiel für die neue Struktur:
        // <settings>
        //   <nick>KDDK22</nick>
        //   <port>9853</port>
        //   <xmlport>9854</xmlport>
        //   ...
        // </settings>

        // Extrahiere die Werte aus der neuen XML-Struktur
        return {
          // Versuche zuerst die neue Struktur, dann die alte als Fallback
          tempdir: this.extractValue(response, 'temporarydirectory') || '/config/appleJuice/temp/',
          incdir: this.extractValue(response, 'incomingdirectory') || '/config/appleJuice/incoming/',
          port: this.extractValue(response, 'port') || '9850',
          xml_port: this.extractValue(response, 'xmlport') || '9851',
          nick: this.extractValue(response, 'nick') || 'applejuice_user_5987',
          maxcon: this.extractValue(response, 'maxconnections') || '500',
          maxul: parseInt(this.extractValue(response, 'maxupload') || '2359296') / 1024, // Bytes zu KB
          uls: this.extractValue(response, 'speedperslot') || '50',
          maxdl: parseInt(this.extractValue(response, 'maxdownload') || '11796480') / 1024, // Bytes zu KB
          conturn: this.extractValue(response, 'maxnewconnectionsperturn') || '50',
          maxdlsrc: this.extractValue(response, 'maxsourcesperfile') || '250',
          autoconnect: this.extractValue(response, 'autoconnect') === 'true' || true
        }
      }

      // Fallback: Standardwerte zurückgeben
      console.warn('Keine Einstellungen in der settings.xml gefunden')
      return {
        tempdir: '/config/appleJuice/temp/',
        incdir: '/config/appleJuice/incoming/',
        port: '9850',
        xml_port: '9851',
        nick: 'applejuice_user_5987',
        maxcon: '500',
        maxul: 2359296 / 1024, // Bytes zu KB
        uls: '50',
        maxdl: 11796480 / 1024, // Bytes zu KB
        conturn: '50',
        maxdlsrc: '250',
        autoconnect: true
      }
    } catch (error) {
      console.error('Fehler beim Abrufen der Einstellungen:', error)
      throw error
    }
  }

  /**
   * Hilfsfunktion zum Extrahieren von Werten aus der XML-Struktur
   * Unterstützt sowohl die neue als auch die alte XML-Struktur
   * @param {Object} data - Geparste XML-Daten
   * @param {string} key - Schlüssel (Tag-Name)
   * @returns {string|null} - Extrahierter Wert oder null
   */
  extractValue(data, key) {
    // Versuche zuerst die neue Struktur (direkte Tags)
    const upperKey = key.toUpperCase();

    // Prüfe, ob das Tag direkt im settings-Objekt existiert
    if (data.settings && data.settings[key]) {
      return data.settings[key];
    }

    // Prüfe, ob das Tag direkt im Root-Objekt existiert
    if (data[key]) {
      return data[key];
    }

    // Fallback zur alten Struktur mit VALUES.CDATA
    if (data[upperKey]?.VALUES?.CDATA) {
      return data[upperKey].VALUES.CDATA;
    }

    // Weitere Fallbacks für verschiedene mögliche Strukturen
    if (data.settings?.[upperKey]?.VALUES?.CDATA) {
      return data.settings[upperKey].VALUES.CDATA;
    }

    if (data.SETTINGS?.[key]) {
      return data.SETTINGS[key];
    }

    if (data.SETTINGS?.[upperKey]) {
      return data.SETTINGS[upperKey];
    }

    return null;
  }

  /**
   * Standardeinstellungen speichern
   * @param {Object} settings - Einstellungen
   * @returns {Promise<boolean>} - Erfolgsstatus
   */
  async saveStandardSettings(settings) {
    try {
      // Einstellungen an den Core senden
      // Verwende die korrekten Parameter-Namen für die neue XML-Struktur
      await coreService.command('function', 'setsettings', {
        incomingdirectory: encodeURIComponent(settings.incdir),
        temporarydirectory: encodeURIComponent(settings.tempdir),
        port: settings.port,
        xmlport: settings.xml_port,
        nick: encodeURIComponent(settings.nick)
      })

      return true
    } catch (error) {
      console.error('Fehler beim Speichern der Standardeinstellungen:', error)
      throw error
    }
  }

  /**
   * Verbindungseinstellungen speichern
   * @param {Object} settings - Einstellungen
   * @returns {Promise<boolean>} - Erfolgsstatus
   */
  async saveConnectionSettings(settings) {
    try {
      // KB zu Bytes umrechnen
      const maxul = Math.floor(settings.maxul * 1024)
      const maxdl = Math.floor(settings.maxdl * 1024)

      // Einstellungen an den Core senden
      // Verwende die korrekten Parameter-Namen für die neue XML-Struktur
      await coreService.command('function', 'setsettings', {
        maxconnections: settings.maxcon,
        maxupload: maxul,
        speedperslot: settings.uls,
        maxdownload: maxdl,
        maxnewconnectionsperturn: settings.conturn,
        autoconnect: settings.autoconnect ? 'true' : 'false',
        maxsourcesperfile: settings.maxdlsrc
      })

      return true
    } catch (error) {
      console.error('Fehler beim Speichern der Verbindungseinstellungen:', error)
      throw error
    }
  }
}

export default new SettingsService()
