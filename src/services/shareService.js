/**
 * AppleJuice Share Service
 * Verwaltet die Kommunikation mit dem AppleJuice Core für Freigaben
 */

import coreService from './coreService.js'
import { parseXmlToJson } from '../utils/xmlParser.js'

class ShareService {
  constructor() {
    this.cache = new Map()
  }

  /**
   * Freigegebene Verzeichnisse abrufen
   * @returns {Promise<Array>} - Liste der freigegebenen Verzeichnisse
   */
  async getSharedDirectories() {
    try {
      // Daten vom Core abrufen
      const response = await coreService.command('xml', 'share.xml')
      
      // Wenn wir bereits geparste Daten haben, diese zurückgeben
      if (response && response.SHARE && response.SHARE.DIRECTORY) {
        const directories = Array.isArray(response.SHARE.DIRECTORY) 
          ? response.SHARE.DIRECTORY 
          : [response.SHARE.DIRECTORY]
        
        return directories.map(dir => {
          return {
            name: dir.NAME?.VALUES?.CDATA || dir.NAME || 'Unbekannt',
            shareMode: dir.SHAREMODE?.VALUES?.CDATA === 'subdirectory' ? 'subdirectory' : 'directory',
            priority: parseInt(dir.PRIORITY?.VALUES?.CDATA || '0', 10)
          }
        })
      }
      
      // Wenn wir die Rohdaten haben, diese parsen
      if (typeof response === 'string') {
        const xmlData = response
        const parsedData = parseXmlToJson(xmlData)
        
        if (parsedData && parsedData.SHARE && parsedData.SHARE.DIRECTORY) {
          const directories = Array.isArray(parsedData.SHARE.DIRECTORY) 
            ? parsedData.SHARE.DIRECTORY 
            : [parsedData.SHARE.DIRECTORY]
          
          return directories.map(dir => {
            return {
              name: dir.NAME?.VALUES?.CDATA || dir.NAME || 'Unbekannt',
              shareMode: dir.SHAREMODE?.VALUES?.CDATA === 'subdirectory' ? 'subdirectory' : 'directory',
              priority: parseInt(dir.PRIORITY?.VALUES?.CDATA || '0', 10)
            }
          })
        }
      }
      
      // Fallback: Leeres Array zurückgeben
      console.warn('Keine Verzeichnisse in der share.xml gefunden')
      return []
    } catch (error) {
      console.error('Fehler beim Abrufen der freigegebenen Verzeichnisse:', error)
      throw error
    }
  }

  /**
   * Temp-Verzeichnis abrufen
   * @returns {Promise<string>} - Pfad zum Temp-Verzeichnis
   */
  async getTempDirectory() {
    try {
      // Daten vom Core abrufen
      const response = await coreService.command('xml', 'settings.xml')
      
      // Temp-Verzeichnis aus den Informationen extrahieren
      if (response && response.GENERALINFORMATION && response.GENERALINFORMATION.TEMPORARYDIR) {
        return response.GENERALINFORMATION.TEMPORARYDIR.VALUES?.CDATA || '/temp'
      }
      
      // Fallback: Standard-Temp-Verzeichnis zurückgeben
      return '/temp'
    } catch (error) {
      console.error('Fehler beim Abrufen des Temp-Verzeichnisses:', error)
      return '/temp'
    }
  }

  /**
   * Unterverzeichniseinstellung ändern
   * @param {string} directory - Verzeichnispfad
   * @param {boolean} includeSubdirectories - Unterverzeichnisse einschließen?
   * @returns {Promise<boolean>} - Erfolgsstatus
   */
  async changeSubdirectory(directory, includeSubdirectories) {
    try {
      // Aktion an den Core senden
      await coreService.command('xml', 'action.xml', {
        action: 'setsubs',
        dir: directory,
        value: includeSubdirectories ? '1' : '0'
      })
      
      return true
    } catch (error) {
      console.error('Fehler beim Ändern der Unterverzeichniseinstellung:', error)
      throw error
    }
  }

  /**
   * Verzeichnis aus der Freigabe entfernen
   * @param {string} directory - Verzeichnispfad
   * @returns {Promise<boolean>} - Erfolgsstatus
   */
  async removeShare(directory) {
    try {
      // Aktion an den Core senden
      await coreService.command('xml', 'action.xml', {
        action: 'removeshare',
        dir: directory
      })
      
      return true
    } catch (error) {
      console.error('Fehler beim Entfernen des Verzeichnisses aus der Freigabe:', error)
      throw error
    }
  }

  /**
   * Neues Verzeichnis freigeben
   * @param {string} directory - Verzeichnispfad
   * @param {boolean} includeSubdirectories - Unterverzeichnisse einschließen?
   * @returns {Promise<boolean>} - Erfolgsstatus
   */
  async addShare(directory, includeSubdirectories) {
    try {
      // Aktion an den Core senden
      await coreService.command('xml', 'action.xml', {
        action: 'addshare',
        dir: directory,
        subs: includeSubdirectories ? '1' : '0'
      })
      
      return true
    } catch (error) {
      console.error('Fehler beim Hinzufügen des Verzeichnisses zur Freigabe:', error)
      throw error
    }
  }

  /**
   * Freigaben überprüfen
   * @returns {Promise<boolean>} - Erfolgsstatus
   */
  async checkShares() {
    try {
      // Aktion an den Core senden
      await coreService.command('xml', 'action.xml', {
        action: 'sharecheck'
      })
      
      return true
    } catch (error) {
      console.error('Fehler beim Überprüfen der Freigaben:', error)
      throw error
    }
  }
}

export default new ShareService()