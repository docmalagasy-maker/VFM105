package com.vfm105.smsgateway

import org.json.JSONArray
import org.json.JSONObject
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL
import java.nio.charset.StandardCharsets

data class SmsAEnvoyer(val reference: String, val telephone: String, val message: String)

/** Client HTTP minimal vers le serveur VFM 105 — pas de dépendance externe. */
object GatewayApi {

    fun recupererEnAttente(baseUrl: String, secret: String): List<SmsAEnvoyer> {
        val connexion = ouvrirConnexion(baseUrl, "/api/sms-gateway/pending", "GET", secret)
        try {
            connexion.connect()
            if (connexion.responseCode != 200) {
                throw Exception("HTTP ${connexion.responseCode}")
            }
            val corps = connexion.inputStream.bufferedReader(StandardCharsets.UTF_8).readText()
            val tableau: JSONArray = JSONObject(corps).getJSONArray("sms")
            return (0 until tableau.length()).map { i ->
                val item = tableau.getJSONObject(i)
                SmsAEnvoyer(
                    reference = item.getString("reference"),
                    telephone = item.getString("telephone"),
                    message = item.getString("message")
                )
            }
        } finally {
            connexion.disconnect()
        }
    }

    fun signalerResultat(baseUrl: String, secret: String, reference: String, succes: Boolean) {
        val connexion = ouvrirConnexion(baseUrl, "/api/sms-gateway/report", "POST", secret)
        connexion.doOutput = true
        connexion.setRequestProperty("Content-Type", "application/json")
        val corps = JSONObject().apply {
            put("reference", reference)
            put("succes", succes)
        }.toString()
        try {
            OutputStreamWriter(connexion.outputStream, StandardCharsets.UTF_8).use { it.write(corps) }
            if (connexion.responseCode !in 200..299) {
                throw Exception("HTTP ${connexion.responseCode}")
            }
        } finally {
            connexion.disconnect()
        }
    }

    private fun ouvrirConnexion(
        baseUrl: String,
        chemin: String,
        methode: String,
        secret: String
    ): HttpURLConnection {
        val url = URL(baseUrl.trimEnd('/') + chemin)
        val connexion = url.openConnection() as HttpURLConnection
        connexion.requestMethod = methode
        connexion.setRequestProperty("X-Gateway-Secret", secret)
        connexion.connectTimeout = 10_000
        connexion.readTimeout = 10_000
        return connexion
    }
}
