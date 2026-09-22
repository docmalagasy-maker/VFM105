package com.vfm105.smsgateway

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import java.text.SimpleDateFormat
import java.util.Locale

/** Journal en mémoire affiché dans l'écran principal (pas persisté). */
object GatewayLog {
    private val format = SimpleDateFormat("HH:mm:ss", Locale.FRANCE)
    private val _lignes = MutableStateFlow<List<String>>(emptyList())
    val lignes: StateFlow<List<String>> = _lignes

    fun ajouter(texte: String) {
        val horodatee = "${format.format(System.currentTimeMillis())}  $texte"
        _lignes.value = (_lignes.value + horodatee).takeLast(50)
    }
}

/** État observable par l'écran principal (la passerelle tourne ou non). */
object GatewayState {
    private val _actif = MutableStateFlow(false)
    val actif: StateFlow<Boolean> = _actif

    fun definirActif(valeur: Boolean) {
        _actif.value = valeur
    }
}
