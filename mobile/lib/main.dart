import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'l10n/app_localizations.dart';
import 'theme/app_theme.dart';
import 'screens/login_screen.dart';

void main() {
  runApp(const SmartGramaApp());
}

class SmartGramaApp extends StatefulWidget {
  const SmartGramaApp({super.key});

  static void setLocale(BuildContext context, Locale newLocale) {
    _SmartGramaAppState? state = context.findAncestorStateOfType<_SmartGramaAppState>();
    state?.setLocale(newLocale);
  }

  @override
  State<SmartGramaApp> createState() => _SmartGramaAppState();
}

class _SmartGramaAppState extends State<SmartGramaApp> {
  Locale _locale = const Locale('en');

  void setLocale(Locale locale) {
    setState(() {
      _locale = locale;
    });
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'SmartGrama',
      debugShowCheckedModeBanner: false,
      locale: _locale,
      localizationsDelegates: [
        AppLocalizations.delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      supportedLocales: const [
        Locale('en', ''),
        Locale('si', ''),
      ],
      theme: AppTheme.theme,
      home: const LoginScreen(),
    );
  }
}

