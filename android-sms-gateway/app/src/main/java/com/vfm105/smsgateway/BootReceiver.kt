package com.vfm105.smsgateway

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import androidx.core.content.ContextCompat

/** Redémarre la passerelle après un redémarrage du téléphone, si elle était active. */
class BootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_BOOT_COMPLETED && Prefs.estActif(context)) {
            val intentService = Intent(context, GatewayService::class.java)
            ContextCompat.startForegroundService(context, intentService)
        }
    }
}
