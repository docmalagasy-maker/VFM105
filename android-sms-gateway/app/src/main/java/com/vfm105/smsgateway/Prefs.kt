package com.vfm105.smsgateway

import android.content.Context

/** Paramètres persistés localement (adresse du site, secret, état voulu). */
object Prefs {
    private const val FICHIER = "vfm105_gateway_prefs"
    private const val CLE_URL = "server_url"
    private const val CLE_SECRET = "secret"
    private const val CLE_ACTIF = "actif"
    private const val URL_PAR_DEFAUT = "https://vfm-105.vercel.app"

    fun sauvegarder(context: Context, url: String, secret: String) {
        prefs(context).edit()
            .putString(CLE_URL, url)
            .putString(CLE_SECRET, secret)
            .apply()
    }

    fun url(context: Context): String =
        prefs(context).getString(CLE_URL, URL_PAR_DEFAUT) ?: URL_PAR_DEFAUT

    fun secret(context: Context): String =
        prefs(context).getString(CLE_SECRET, "") ?: ""

    fun definirActif(context: Context, actif: Boolean) {
        prefs(context).edit().putBoolean(CLE_ACTIF, actif).apply()
    }

    fun estActif(context: Context): Boolean = prefs(context).getBoolean(CLE_ACTIF, false)

    private fun prefs(context: Context) =
        context.getSharedPreferences(FICHIER, Context.MODE_PRIVATE)
}
