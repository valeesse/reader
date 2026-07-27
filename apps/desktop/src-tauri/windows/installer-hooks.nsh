; File associations are declared in tauri.conf.json so other platforms can
; advertise them too. The Windows installer adds a dedicated options page and
; removes the formats that are not checked after Tauri registers them.
;
; Associations are opt-in for fresh silent installs as well:
;   setup.exe /S /ASSOCIATE_EPUB /ASSOCIATE_TXT

Var ZenithAssociateEpub
Var ZenithAssociateTxt
Var ZenithAssociationSelectionInitialized
Var ZenithAssociateEpubCheckbox
Var ZenithAssociateTxtCheckbox

Function ZenithInitAssociationSelection
  ${If} $ZenithAssociationSelectionInitialized == 1
    Return
  ${EndIf}

  StrCpy $ZenithAssociationSelectionInitialized 1
  StrCpy $ZenithAssociateEpub 0
  StrCpy $ZenithAssociateTxt 0

  ; Preserve associations during an interactive or silent upgrade.
  ReadRegStr $0 SHELL_CONTEXT "Software\Classes\.epub" ""
  ${If} $0 == "Zenith Reader EPUB"
    StrCpy $ZenithAssociateEpub 1
  ${EndIf}

  ReadRegStr $0 SHELL_CONTEXT "Software\Classes\.txt" ""
  ${If} $0 == "Zenith Reader TXT"
    StrCpy $ZenithAssociateTxt 1
  ${EndIf}

  ${GetOptions} $CMDLINE "/ASSOCIATE_EPUB" $0
  ${IfNot} ${Errors}
    StrCpy $ZenithAssociateEpub 1
  ${EndIf}

  ${GetOptions} $CMDLINE "/ASSOCIATE_TXT" $0
  ${IfNot} ${Errors}
    StrCpy $ZenithAssociateTxt 1
  ${EndIf}
FunctionEnd

!macro NSIS_HOOK_INSTALLER_PAGES
  Page custom ZenithFileAssociationsPage ZenithFileAssociationsLeave
!macroend

Function ZenithFileAssociationsPage
  ${If} $PassiveMode = 1
    Abort
  ${EndIf}
  ${If} ${Silent}
    Abort
  ${EndIf}

  Call ZenithInitAssociationSelection
  !insertmacro MUI_HEADER_TEXT "文件关联" "选择要由 ${PRODUCTNAME} 打开的文件类型"

  nsDialogs::Create 1018
  Pop $0
  ${IfThen} $(^RTL) = 1 ${|} nsDialogs::SetRTL $(^RTL) ${|}

  ${NSD_CreateLabel} 0 0 100% 28u "安装程序可以注册以下文件类型。以后也可以在应用设置或 Windows 默认应用中更改。"
  Pop $0

  ${NSD_CreateCheckbox} 15u 42u 90% 12u "关联 EPUB 电子书文件"
  Pop $ZenithAssociateEpubCheckbox
  ${If} $ZenithAssociateEpub == 1
    ${NSD_Check} $ZenithAssociateEpubCheckbox
  ${EndIf}

  ${NSD_CreateCheckbox} 15u 66u 90% 12u "关联 TXT 文本文档"
  Pop $ZenithAssociateTxtCheckbox
  ${If} $ZenithAssociateTxt == 1
    ${NSD_Check} $ZenithAssociateTxtCheckbox
  ${EndIf}

  nsDialogs::Show
FunctionEnd

Function ZenithFileAssociationsLeave
  ${NSD_GetState} $ZenithAssociateEpubCheckbox $ZenithAssociateEpub
  ${NSD_GetState} $ZenithAssociateTxtCheckbox $ZenithAssociateTxt
FunctionEnd

!macro NSIS_HOOK_PREINSTALL
  Call ZenithInitAssociationSelection

  ; On reinstall, restore the association saved by the previous installation
  ; before Tauri creates a fresh backup. Otherwise Zenith's own ProgID would be
  ; backed up and could not be removed when the user opts out or uninstalls.
  ReadRegStr $0 SHELL_CONTEXT "Software\Classes\.epub" ""
  ${If} $0 == "Zenith Reader EPUB"
    !insertmacro APP_UNASSOCIATE "epub" "Zenith Reader EPUB"
  ${EndIf}

  ReadRegStr $0 SHELL_CONTEXT "Software\Classes\.txt" ""
  ${If} $0 == "Zenith Reader TXT"
    !insertmacro APP_UNASSOCIATE "txt" "Zenith Reader TXT"
  ${EndIf}
!macroend

!macro NSIS_HOOK_POSTINSTALL
  ${If} $ZenithAssociateEpub != 1
    !insertmacro APP_UNASSOCIATE "epub" "Zenith Reader EPUB"
  ${EndIf}

  ${If} $ZenithAssociateTxt != 1
    !insertmacro APP_UNASSOCIATE "txt" "Zenith Reader TXT"
  ${EndIf}
!macroend
