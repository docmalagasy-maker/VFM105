package com.vfm105.smsgateway

import android.Manifest
import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import com.vfm105.smsgateway.databinding.ActivityMainBinding
import kotlinx.coroutines.launch

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding

    private val demandePermissions = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { resultats ->
        if (resultats[Manifest.permission.SEND_SMS] == true) {
            demarrerPasserelle()
        } else {
            Toast.makeText(this, getString(R.string.permission_required), Toast.LENGTH_LONG).show()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.editServerUrl.setText(Prefs.url(this))
        binding.editSecret.setText(Prefs.secret(this))

        binding.buttonToggle.setOnClickListener {
            if (GatewayState.actif.value) {
                arreterPasserelle()
            } else {
                enregistrerParametresEtDemarrer()
            }
        }

        lifecycleScope.launch {
            GatewayState.actif.collect { actif -> mettreAJourEtat(actif) }
        }
        lifecycleScope.launch {
            GatewayLog.lignes.collect { lignes -> binding.textLog.text = lignes.joinToString("\n") }
        }
    }

    private fun enregistrerParametresEtDemarrer() {
        val url = binding.editServerUrl.text.toString().trim()
        val secret = binding.editSecret.text.toString().trim()
        if (url.isBlank() || secret.isBlank()) {
            Toast.makeText(this, "Renseigne l'adresse du site et le secret.", Toast.LENGTH_LONG).show()
            return
        }
        Prefs.sauvegarder(this, url, secret)

        val permissionsNecessaires = mutableListOf(Manifest.permission.SEND_SMS)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            permissionsNecessaires.add(Manifest.permission.POST_NOTIFICATIONS)
        }
        demandePermissions.launch(permissionsNecessaires.toTypedArray())
    }

    private fun demarrerPasserelle() {
        Prefs.definirActif(this, true)
        ContextCompat.startForegroundService(this, Intent(this, GatewayService::class.java))
        GatewayLog.ajouter("Passerelle démarrée")
    }

    private fun arreterPasserelle() {
        Prefs.definirActif(this, false)
        stopService(Intent(this, GatewayService::class.java))
        GatewayLog.ajouter("Passerelle arrêtée")
    }

    private fun mettreAJourEtat(actif: Boolean) {
        binding.textStatus.text = getString(if (actif) R.string.status_running else R.string.status_stopped)
        binding.buttonToggle.text = getString(if (actif) R.string.button_stop else R.string.button_start)
    }
}
