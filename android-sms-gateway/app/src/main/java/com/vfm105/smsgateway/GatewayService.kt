package com.vfm105.smsgateway

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.os.IBinder
import android.telephony.SmsManager
import androidx.core.app.NotificationCompat
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.cancel
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

/**
 * Service au premier plan qui interroge périodiquement le serveur VFM 105
 * pour relever les SMS en attente et les envoie avec la carte SIM du
 * téléphone. Ne reçoit jamais de requête entrante : aucun visiteur du site
 * ne peut donc déclencher un envoi depuis l'extérieur.
 */
class GatewayService : Service() {

    private val portee = CoroutineScope(Dispatchers.IO + Job())
    private var boucleDemarree = false

    companion object {
        private const val ID_CANAL = "passerelle_sms"
        private const val ID_NOTIFICATION = 1
        private const val INTERVALLE_MS = 15_000L
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        creerCanalNotification()
        GatewayState.definirActif(true)
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        startForeground(ID_NOTIFICATION, construireNotification("En attente du premier sondage..."))
        if (!boucleDemarree) {
            boucleDemarree = true
            demarrerBoucle()
        }
        return START_STICKY
    }

    override fun onDestroy() {
        super.onDestroy()
        portee.cancel()
        GatewayState.definirActif(false)
    }

    private fun demarrerBoucle() {
        val contexte = applicationContext
        portee.launch {
            while (true) {
                sonder(contexte)
                delay(INTERVALLE_MS)
            }
        }
    }

    private fun sonder(contexte: Context) {
        val url = Prefs.url(contexte)
        val secret = Prefs.secret(contexte)
        if (secret.isBlank()) {
            GatewayLog.ajouter("Secret non configuré, sondage ignoré.")
            return
        }
        try {
            val liste = GatewayApi.recupererEnAttente(url, secret)
            if (liste.isEmpty()) {
                majNotification("Aucun SMS en attente")
            } else {
                GatewayLog.ajouter("${liste.size} SMS à envoyer")
                for (sms in liste) {
                    envoyerEtSignaler(url, secret, sms)
                }
                majNotification("${liste.size} SMS traité(s)")
            }
        } catch (erreur: Exception) {
            GatewayLog.ajouter("Erreur de sondage : ${erreur.message}")
            majNotification("Erreur de connexion au serveur")
        }
    }

    private fun envoyerEtSignaler(url: String, secret: String, sms: SmsAEnvoyer) {
        val succes = try {
            envoyerSms(sms.telephone, sms.message)
            GatewayLog.ajouter("SMS envoyé à ${sms.telephone} (${sms.reference})")
            true
        } catch (erreur: Exception) {
            GatewayLog.ajouter("Échec d'envoi ${sms.reference} : ${erreur.message}")
            false
        }
        try {
            GatewayApi.signalerResultat(url, secret, sms.reference, succes)
        } catch (erreur: Exception) {
            GatewayLog.ajouter("Échec du signalement pour ${sms.reference} : ${erreur.message}")
        }
    }

    private fun envoyerSms(telephone: String, message: String) {
        @Suppress("DEPRECATION")
        val gestionnaire = SmsManager.getDefault()
        val parties = gestionnaire.divideMessage(message)
        if (parties.size > 1) {
            gestionnaire.sendMultipartTextMessage(telephone, null, parties, null, null)
        } else {
            gestionnaire.sendTextMessage(telephone, null, message, null, null)
        }
    }

    private fun creerCanalNotification() {
        val gestionnaire = getSystemService(NotificationManager::class.java)
        val canal = NotificationChannel(
            ID_CANAL,
            getString(R.string.notification_channel_name),
            NotificationManager.IMPORTANCE_LOW
        )
        gestionnaire.createNotificationChannel(canal)
    }

    private fun construireNotification(texte: String): Notification =
        NotificationCompat.Builder(this, ID_CANAL)
            .setContentTitle(getString(R.string.notification_title))
            .setContentText(texte)
            .setSmallIcon(android.R.drawable.stat_notify_sync)
            .setOngoing(true)
            .build()

    private fun majNotification(texte: String) {
        val gestionnaire = getSystemService(NotificationManager::class.java)
        gestionnaire.notify(ID_NOTIFICATION, construireNotification(texte))
    }
}
