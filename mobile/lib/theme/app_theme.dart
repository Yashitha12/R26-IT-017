import 'package:flutter/material.dart';
import '../main.dart';

class AppColors {
  // Primary brand (Deep Indigo / Slate)
  static const Color primary = Color(0xFF3730A3);
  static const Color primaryDark = Color(0xFF1E1B4B);
  static const Color primaryLight = Color(0xFFEEF2FF);
  static const Color primaryHover = Color(0xFF312E81);

  // Micro-loan accent (Vibrant Indigo)
  static const Color accent = Color(0xFF4F46E5);
  static const Color accentLight = Color(0xFFE0E7FF);

  // Welfare & Social Protection (Emerald Green)
  static const Color welfare = Color(0xFF059669);
  static const Color welfareLight = Color(0xFFDCFCE7);
  static const Color welfareDark = Color(0xFF065F46);

  // Neutrals & Surfaces
  static const Color background = Color(0xFFF8FAFC);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color surfaceSubtle = Color(0xFFF1F5F9);
  static const Color border = Color(0xFFE2E8F0);
  static const Color borderSubtle = Color(0xFFCBD5E1);

  // Typography
  static const Color textPrimary = Color(0xFF0F172A);
  static const Color textSecondary = Color(0xFF64748B);
  static const Color textMuted = Color(0xFF94A3B8);

  // Status colors
  static const Color success = Color(0xFF10B981);
  static const Color successBg = Color(0xFFECFDF5);
  static const Color successBorder = Color(0xFFA7F3D0);
  static const Color successText = Color(0xFF065F46);

  static const Color warning = Color(0xFFD97706);
  static const Color warningBg = Color(0xFFFFFBEB);
  static const Color warningBorder = Color(0xFFFDE68A);
  static const Color warningText = Color(0xFF92400E);

  static const Color danger = Color(0xFFEF4444);
  static const Color dangerBg = Color(0xFFFEF2F2);
  static const Color dangerBorder = Color(0xFFFECDD3);
  static const Color dangerText = Color(0xFF991B1B);

  // Teal brand emblem
  static const Color tealBrand = Color(0xFF0D9488);
}

class AppTheme {
  static ThemeData get theme {
    return ThemeData(
      useMaterial3: true,
      scaffoldBackgroundColor: AppColors.background,
      fontFamily: 'Inter',
      colorScheme: ColorScheme.fromSeed(
        seedColor: AppColors.primary,
        primary: AppColors.primary,
        secondary: AppColors.welfare,
        surface: AppColors.surface,
        background: AppColors.background,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.surface,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: false,
        iconTheme: IconThemeData(color: AppColors.textPrimary),
        titleTextStyle: TextStyle(
          color: AppColors.textPrimary,
          fontSize: 18,
          fontWeight: FontWeight.w700,
          fontFamily: 'Inter',
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.surface,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.border, width: 1.5),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.border, width: 1.5),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.primary, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.danger, width: 1.5),
        ),
        labelStyle: const TextStyle(color: AppColors.textSecondary, fontSize: 14),
        hintStyle: const TextStyle(color: AppColors.textMuted, fontSize: 14),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          elevation: 0,
          minimumSize: const Size(double.infinity, 50),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          textStyle: const TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.w600,
            fontFamily: 'Inter',
          ),
        ),
      ),
    );
  }
}

class AppComponents {
  /// Top segmented language pill switcher [ EN | සිං ] matching web navbar
  static Widget langPillToggle(BuildContext context) {
    final currentLang = Localizations.localeOf(context).languageCode;
    final isEn = currentLang == 'en';

    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFFF1F5F9),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: const Color(0xFFCBD5E1), width: 1),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          _langSegmentButton(
            label: 'EN',
            isSelected: isEn,
            onTap: () {
              if (!isEn) {
                SmartGramaApp.setLocale(context, const Locale('en', ''));
              }
            },
          ),
          _langSegmentButton(
            label: 'සිං',
            isSelected: !isEn,
            onTap: () {
              if (isEn) {
                SmartGramaApp.setLocale(context, const Locale('si', ''));
              }
            },
          ),
        ],
      ),
    );
  }

  static Widget _langSegmentButton({
    required String label,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary : Colors.transparent,
          borderRadius: BorderRadius.circular(6),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
            color: isSelected ? Colors.white : AppColors.textSecondary,
          ),
        ),
      ),
    );
  }

  /// Official SmartGrama logo image
  static Widget smartgramaLogo({double height = 36}) {
    return Image.asset(
      'assets/smartgrama.png',
      height: height,
      fit: BoxFit.contain,
      errorBuilder: (_, __, ___) => Container(
        width: height,
        height: height,
        decoration: BoxDecoration(
          color: AppColors.tealBrand,
          borderRadius: BorderRadius.circular(10),
        ),
        child: const Icon(Icons.account_balance, color: Colors.white, size: 20),
      ),
    );
  }

  /// Official SmartGrama AI Robot circular avatar
  static Widget aiBotAvatar({double size = 36, bool hasBorder = true}) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: Colors.white,
        border: hasBorder ? Border.all(color: const Color(0xFF10B981), width: 2) : null,
        boxShadow: const [
          BoxShadow(
            color: Color(0x3310B981),
            blurRadius: 6,
            offset: Offset(0, 2),
          ),
        ],
      ),
      clipBehavior: Clip.antiAlias,
      child: Image.asset(
        'assets/new-bot-logo.jpg',
        fit: BoxFit.contain,
        errorBuilder: (_, __, ___) => const Icon(Icons.smart_toy, color: Color(0xFF10B981)),
      ),
    );
  }

  /// Exact AI Assistant floating widget matching the web platform with dual speech tags (AI සහයක / AI Assist)
  static Widget aiFloatingAssistantWidget(BuildContext context, {required VoidCallback onTap}) {
    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          // Speech tags column on the left
          Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              _speechTag('AI සහයක'),
              const SizedBox(height: 6),
              _speechTag('AI Assist'),
            ],
          ),
          const SizedBox(width: 8),

          // Glowing circular robot button
          Container(
            width: 76,
            height: 76,
            decoration: BoxDecoration(
              color: Colors.white,
              shape: BoxShape.circle,
              border: Border.all(color: const Color(0xFF10B981), width: 3),
              boxShadow: const [
                BoxShadow(
                  color: Color(0x4010B981),
                  blurRadius: 16,
                  spreadRadius: 2,
                  offset: Offset(0, 4),
                ),
                BoxShadow(
                  color: Color(0x1A000000),
                  blurRadius: 8,
                  offset: Offset(0, 2),
                ),
              ],
            ),
            clipBehavior: Clip.antiAlias,
            child: Image.asset(
              'assets/new-bot-logo.jpg',
              fit: BoxFit.contain,
              errorBuilder: (_, __, ___) => const Icon(Icons.smart_toy, color: Color(0xFF10B981), size: 36),
            ),
          ),
        ],
      ),
    );
  }

  static Widget _speechTag(String text) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
          decoration: BoxDecoration(
            color: const Color(0xFFFFF9C4),
            borderRadius: BorderRadius.circular(12),
            boxShadow: const [
              BoxShadow(
                color: Color(0x1F000000),
                blurRadius: 8,
                offset: Offset(0, 2),
              ),
            ],
          ),
          child: Text(
            text,
            style: const TextStyle(
              color: Color(0xFF262626),
              fontWeight: FontWeight.w800,
              fontSize: 13,
            ),
          ),
        ),
        CustomPaint(
          size: const Size(6, 10),
          painter: TrianglePointerPainter(const Color(0xFFFFF9C4)),
        ),
      ],
    );
  }

  /// Unified modern AppBar with official logo, title, subtitle, and top navbar language pill
  static PreferredSizeWidget headerAppBar(
    BuildContext context, {
    required String title,
    String? subtitle,
    bool showBack = false,
    bool showLangPill = true,
    VoidCallback? onBack,
    List<Widget>? extraActions,
  }) {
    return AppBar(
      automaticallyImplyLeading: false,
      titleSpacing: showBack ? 0 : 16,
      leading: showBack
          ? IconButton(
              icon: const Icon(Icons.arrow_back_ios_new, size: 18, color: AppColors.textPrimary),
              onPressed: onBack ?? () => Navigator.pop(context),
            )
          : null,
      title: Row(
        children: [
          if (!showBack) ...[
            smartgramaLogo(height: 36),
            const SizedBox(width: 12),
          ],
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textPrimary,
                    letterSpacing: -0.2,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
                if (subtitle != null && subtitle.isNotEmpty)
                  Text(
                    subtitle,
                    style: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w500,
                      color: AppColors.textSecondary,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
              ],
            ),
          ),
        ],
      ),
      actions: [
        if (extraActions != null) ...extraActions,
        if (showLangPill) ...[
          Padding(
            padding: const EdgeInsets.only(right: 16),
            child: langPillToggle(context),
          ),
        ],
      ],
      bottom: PreferredSize(
        preferredSize: const Size.fromHeight(1),
        child: Container(
          color: AppColors.border,
          height: 1,
        ),
      ),
    );
  }

  /// Modern Card matching the web's .card component
  static Widget card({
    required Widget child,
    EdgeInsetsGeometry padding = const EdgeInsets.all(20),
    VoidCallback? onTap,
    Color? color,
    Border? border,
    BorderRadius? borderRadius,
  }) {
    final cardBorderRadius = borderRadius ?? BorderRadius.circular(16);

    Widget content = Container(
      padding: padding,
      decoration: BoxDecoration(
        color: color ?? AppColors.surface,
        borderRadius: cardBorderRadius,
        border: border ?? Border.all(color: AppColors.border, width: 1.5),
        boxShadow: const [
          BoxShadow(
            color: Color(0x0A000000),
            blurRadius: 12,
            offset: Offset(0, 3),
          ),
        ],
      ),
      child: child,
    );

    if (onTap != null) {
      return InkWell(
        onTap: onTap,
        borderRadius: cardBorderRadius,
        child: content,
      );
    }
    return content;
  }

  /// Primary button with 12px radius, bold text, 50px height
  static Widget primaryButton({
    required String label,
    required VoidCallback? onPressed,
    bool isLoading = false,
    IconData? icon,
    Color? backgroundColor,
    Color? foregroundColor,
  }) {
    final bg = backgroundColor ?? AppColors.primary;
    final fg = foregroundColor ?? Colors.white;

    return SizedBox(
      width: double.infinity,
      height: 50,
      child: ElevatedButton(
        style: ElevatedButton.styleFrom(
          backgroundColor: bg,
          foregroundColor: fg,
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          disabledBackgroundColor: bg.withOpacity(0.6),
        ),
        onPressed: isLoading ? null : onPressed,
        child: isLoading
            ? SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  valueColor: AlwaysStoppedAnimation<Color>(fg),
                ),
              )
            : Row(
                mainAxisAlignment: MainAxisAlignment.center,
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (icon != null) ...[
                    Icon(icon, size: 18),
                    const SizedBox(width: 8),
                  ],
                  Flexible(
                    child: Text(
                      label,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                        color: fg,
                      ),
                    ),
                  ),
                ],
              ),
      ),
    );
  }

  /// Secondary button with 12px radius and border
  static Widget secondaryButton({
    required String label,
    required VoidCallback? onPressed,
    IconData? icon,
  }) {
    return SizedBox(
      width: double.infinity,
      height: 50,
      child: OutlinedButton(
        style: OutlinedButton.styleFrom(
          backgroundColor: AppColors.surface,
          foregroundColor: AppColors.textPrimary,
          elevation: 0,
          side: const BorderSide(color: AppColors.borderSubtle, width: 1.5),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
        onPressed: onPressed,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          mainAxisSize: MainAxisSize.min,
          children: [
            if (icon != null) ...[
              Icon(icon, size: 18, color: AppColors.textSecondary),
              const SizedBox(width: 8),
            ],
            Flexible(
              child: Text(
                label,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textPrimary,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// Status badge matching web .status-badge
  static Widget statusBadge({
    required String label,
    required Color background,
    required Color textColor,
    Color? borderColor,
    IconData? icon,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: background,
        borderRadius: BorderRadius.circular(20),
        border: borderColor != null ? Border.all(color: borderColor, width: 1) : null,
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, size: 13, color: textColor),
            const SizedBox(width: 4),
          ],
          Text(
            label,
            style: TextStyle(
              color: textColor,
              fontSize: 12,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  /// Citizen DID pill badge
  static Widget didBadge(String did) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
      decoration: BoxDecoration(
        color: const Color(0xFFDCFCE7),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFF86EFAC), width: 1),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.verified_user, size: 13, color: Color(0xFF166534)),
          const SizedBox(width: 4),
          Text(
            did,
            style: const TextStyle(
              color: Color(0xFF166534),
              fontSize: 11,
              fontWeight: FontWeight.w700,
              fontFamily: 'monospace',
            ),
          ),
        ],
      ),
    );
  }
}

class TrianglePointerPainter extends CustomPainter {
  final Color color;
  const TrianglePointerPainter(this.color);

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.fill;
    final path = Path()
      ..moveTo(0, 0)
      ..lineTo(size.width, size.height / 2)
      ..lineTo(0, size.height)
      ..close();
    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
