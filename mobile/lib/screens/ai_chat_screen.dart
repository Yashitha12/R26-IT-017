import 'package:flutter/material.dart';
import 'package:speech_to_text/speech_to_text.dart' as stt;
import '../theme/app_theme.dart';
import '../theme/app_strings.dart';
import '../api_service.dart';

class AIChatScreen extends StatefulWidget {
  final bool isEmbedded;
  const AIChatScreen({super.key, this.isEmbedded = false});

  @override
  State<AIChatScreen> createState() => _AIChatScreenState();
}

class _AIChatScreenState extends State<AIChatScreen> {
  final TextEditingController _controller = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final List<Map<String, String>> _messages = [
    {
      'role': 'assistant',
      'content': 'Hello! I am your SmartGrama AI Assistant. You can ask me questions about Aswesuma welfare PMT eligibility, microfinance loan options, or your digital identity verification in either English or Sinhala.'
    }
  ];
  bool _isLoading = false;
  final bool _useRag = true;

  late stt.SpeechToText _speech;
  bool _isListening = false;

  @override
  void initState() {
    super.initState();
    _speech = stt.SpeechToText();
  }

  @override
  void dispose() {
    _controller.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _listen(String langCode) async {
    if (!_isListening) {
      bool available = await _speech.initialize(
        onStatus: (status) {
          if (status == 'notListening' || status == 'done') {
            setState(() => _isListening = false);
          }
        },
        onError: (_) => setState(() => _isListening = false),
      );

      if (available) {
        setState(() => _isListening = true);
        _speech.listen(
          onResult: (result) {
            setState(() {
              _controller.text = result.recognizedWords;
            });
          },
          localeId: langCode == 'si' ? 'si_LK' : 'en_US',
        );
      }
    } else {
      setState(() => _isListening = false);
      _speech.stop();
    }
  }

  void _sendMessage([String? prefilledText]) async {
    final text = (prefilledText ?? _controller.text).trim();
    if (text.isEmpty) return;

    final langCode = Localizations.localeOf(context).languageCode;

    if (_isListening) {
      _speech.stop();
      setState(() => _isListening = false);
    }

    setState(() {
      _messages.add({'role': 'user', 'content': text});
      _isLoading = true;
    });
    _controller.clear();
    _scrollToBottom();

    try {
      final response = await ApiService.sendChatMessage(text, langCode, _useRag);
      if (!mounted) return;
      setState(() {
        _messages.add({'role': 'assistant', 'content': response['reply'] ?? 'No response received from AI.'});
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _messages.add({
          'role': 'assistant',
          'content': 'I am currently unable to reach the knowledge assistant. You can check your application status on the resident dashboard.'
        });
      });
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
        _scrollToBottom();
      }
    }
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final s = AppStrings.of(context);
    final currentLang = Localizations.localeOf(context).languageCode;

    final content = Column(
      children: [
        // Quick Question Chips Row
        Container(
          color: AppColors.surface,
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          child: SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                _quickPromptChip(s.promptAswesuma),
                const SizedBox(width: 8),
                _quickPromptChip(s.promptMicroloan),
                const SizedBox(width: 8),
                _quickPromptChip(s.promptKyc),
              ],
            ),
          ),
        ),
        const Divider(height: 1, color: AppColors.border),

        // Message Bubbles List
        Expanded(
          child: ListView.builder(
            controller: _scrollController,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
            itemCount: _messages.length,
            itemBuilder: (context, index) {
              final msg = _messages[index];
              final isUser = msg['role'] == 'user';
              return _chatBubble(msg['content'] ?? '', isUser);
            },
          ),
        ),

        if (_isLoading)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
            alignment: Alignment.centerLeft,
            child: Row(
              children: const [
                SizedBox(
                  width: 14,
                  height: 14,
                  child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.primary),
                ),
                SizedBox(width: 10),
                Text('SmartGrama AI is thinking...', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
              ],
            ),
          ),

        // Bottom Input Bar
        Container(
          padding: const EdgeInsets.fromLTRB(16, 10, 16, 16),
          decoration: const BoxDecoration(
            color: AppColors.surface,
            border: Border(top: BorderSide(color: AppColors.border, width: 1)),
          ),
          child: Row(
            children: [
              // Voice Dictation Button
              Container(
                decoration: BoxDecoration(
                  color: _isListening ? AppColors.dangerBg : AppColors.surfaceSubtle,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: _isListening ? AppColors.danger : AppColors.border),
                ),
                child: IconButton(
                  icon: Icon(
                    _isListening ? Icons.mic : Icons.mic_none,
                    color: _isListening ? AppColors.danger : AppColors.textSecondary,
                    size: 20,
                  ),
                  tooltip: 'Voice Search',
                  onPressed: () => _listen(currentLang),
                ),
              ),
              const SizedBox(width: 10),

              // Text Field
              Expanded(
                child: TextField(
                  controller: _controller,
                  textInputAction: TextInputAction.send,
                  onSubmitted: (_) => _sendMessage(),
                  style: const TextStyle(fontSize: 14),
                  decoration: InputDecoration(
                    hintText: s.typeMessage,
                    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                  ),
                ),
              ),
              const SizedBox(width: 10),

              // Send Button
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: AppColors.primary,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: IconButton(
                  icon: const Icon(Icons.send_rounded, color: Colors.white, size: 20),
                  onPressed: () => _sendMessage(),
                ),
              ),
            ],
          ),
        ),
      ],
    );

    if (widget.isEmbedded) {
      return content;
    }

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppComponents.headerAppBar(
        context,
        title: s.chatTitle,
        subtitle: s.chatSubtitle,
        showBack: true,
        showLangPill: true,
        extraActions: [
          Padding(
            padding: const EdgeInsets.only(right: 10),
            child: AppComponents.aiBotAvatar(size: 34),
          ),
        ],
      ),
      body: content,
    );
  }

  Widget _quickPromptChip(String prompt) {
    return ActionChip(
      label: Text(prompt, style: const TextStyle(fontSize: 12, color: AppColors.primary, fontWeight: FontWeight.w600)),
      backgroundColor: AppColors.primaryLight,
      side: const BorderSide(color: Color(0xFFC7D2FE), width: 1),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
      onPressed: () => _sendMessage(prompt),
    );
  }

  Widget _chatBubble(String text, bool isUser) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        mainAxisAlignment: isUser ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (!isUser) ...[
            Padding(
              padding: const EdgeInsets.only(right: 10, top: 2),
              child: AppComponents.aiBotAvatar(size: 34),
            ),
          ],
          Flexible(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: isUser ? AppColors.primary : AppColors.surface,
                borderRadius: BorderRadius.only(
                  topLeft: const Radius.circular(16),
                  topRight: const Radius.circular(16),
                  bottomLeft: Radius.circular(isUser ? 16 : 4),
                  bottomRight: Radius.circular(isUser ? 4 : 16),
                ),
                border: isUser ? null : Border.all(color: AppColors.border, width: 1.5),
                boxShadow: const [
                  BoxShadow(color: Color(0x06000000), blurRadius: 8, offset: Offset(0, 2)),
                ],
              ),
              child: Text(
                text,
                style: TextStyle(
                  color: isUser ? Colors.white : AppColors.textPrimary,
                  fontSize: 14,
                  height: 1.4,
                ),
              ),
            ),
          ),
          if (isUser) const SizedBox(width: 8),
        ],
      ),
    );
  }
}
