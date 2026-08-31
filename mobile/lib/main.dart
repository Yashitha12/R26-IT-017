import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'l10n/app_localizations.dart';
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
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF1D4ED8),
          primary: const Color(0xFF1D4ED8), // Deep Blue
          secondary: const Color(0xFF7E22CE), // Purple
          tertiary: const Color(0xFF10B981), // Green
        ),
        useMaterial3: true,
        scaffoldBackgroundColor: const Color(0xFFF0FDF4).withOpacity(0.3),
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.white,
          elevation: 0,
          centerTitle: false,
          iconTheme: IconThemeData(color: Color(0xFF1E293B)),
          titleTextStyle: TextStyle(
            color: Color(0xFF1E293B),
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        navigationBarTheme: NavigationBarThemeData(
          backgroundColor: Colors.white,
          indicatorColor: Colors.transparent,
          labelTextStyle: MaterialStateProperty.resolveWith((states) {
            if (states.contains(MaterialState.selected)) {
              return const TextStyle(color: Color(0xFF1D4ED8), fontSize: 12, fontWeight: FontWeight.bold);
            }
            return const TextStyle(color: Colors.grey, fontSize: 12);
          }),
          iconTheme: MaterialStateProperty.resolveWith((states) {
            if (states.contains(MaterialState.selected)) {
              return const IconThemeData(color: Color(0xFF1D4ED8));
            }
            return const IconThemeData(color: Colors.grey);
          }),
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF1D4ED8),
            foregroundColor: Colors.white,
            elevation: 0,
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
          ),
        ),
      ),
      home: LoginScreen(),
    );
  }
}

